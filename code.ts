/* eslint-disable @typescript-eslint/no-explicit-any */
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.

// Send the extracted layers to the UI
figma.showUI(__html__, { 
  themeColors: true,
  width: 400,
  height: 400
});

// Initialize an empty array to hold the extracted layers
const layers: any[] = [];

// Helper function to extract common properties (like fills, strokes, and effects)
function extractCommonProperties(node: SceneNode) {
  return {
    fills: 'fills' in node ? node.fills : null,
    strokes: 'strokes' in node ? node.strokes : null,
    effects: 'effects' in node ? node.effects : null,
  };
}

// Helper function to extract the numeric part from node.id (after the colon)
function extractId(id: string): number {
  const parts = id.split(':');
  return parts.length > 1 ? parseInt(parts[1], 10) : parseInt(id, 10);
}

// Helper function to generate a UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to extract all layers, recursively traversing child layers
async function extractLayers(node: SceneNode) {
  // Create a new layer object with common properties
  const layer: any = {
    id: generateUUID(),
    type: node.type,
    name: node.name,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    zIndex: extractId(node.id),
    ...extractCommonProperties(node) // Add common properties
  };

  // If it's a text node, extract text-specific properties
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    layer.characters = textNode.characters;
    layer.fontSize = textNode.fontSize;
    layer.fontName = textNode.fontName;
    layer.fontWeight = textNode.fontWeight;
    layer.textAlignHorizontal = textNode.textAlignHorizontal;
    layer.textAlignVertical = textNode.textAlignVertical;
    layer.letterSpacing = textNode.letterSpacing;
    layer.lineHeight = textNode.lineHeight;
    layer.paragraphIndent = textNode.paragraphIndent;
    layer.paragraphSpacing = textNode.paragraphSpacing;
    layer.textCase = textNode.textCase;
    layer.textDecoration = textNode.textDecoration;
    layer.textAutoResize = textNode.textAutoResize;
  }

  // If it's a ellipse node, extract ellipse-specific properties
  if (node.type === 'ELLIPSE') {
    const ellipseNode = node as EllipseNode;
    layer.arcData = ellipseNode.arcData;
    layer.isMask = ellipseNode.isMask;
    layer.markType = ellipseNode.maskType;
    layer.cornerRadius = ellipseNode.cornerRadius;
  }

  // If it's a rectangle node, extract rectangle-specific properties
  if (node.type === 'RECTANGLE') {
    const rectangleNode = node as RectangleNode;
    layer.isMask = rectangleNode.isMask;
    layer.markType = rectangleNode.maskType;
    if (rectangleNode.cornerRadius !== figma.mixed) {
      layer.cornerRadius = rectangleNode.cornerRadius;
    } else {
      layer.cornerRadius = {
        topLeft: rectangleNode.topLeftRadius,
        topRight: rectangleNode.topRightRadius,
        bottomLeft: rectangleNode.bottomLeftRadius,
        bottomRight: rectangleNode.bottomRightRadius
      };
    }
    if (rectangleNode.strokeWeight !== figma.mixed) {
      layer.strokeWeight = rectangleNode.strokeWeight;
    } else {
      layer.strokeWeight = {
        top: rectangleNode.strokeTopWeight,
        right: rectangleNode.strokeRightWeight,
        bottom: rectangleNode.strokeBottomWeight,
        left: rectangleNode.strokeLeftWeight
      };
    }
    layer.relativeTransform = rectangleNode.relativeTransform;
    layer.absoluteTransform = rectangleNode.absoluteTransform;
    layer.rotation = rectangleNode.rotation;
  }

  // If it's a vector node, extract vector-specific properties
  if (node.type === 'VECTOR') {
    const vectorNode = node as VectorNode;
    layer.vectorPaths = vectorNode.vectorPaths;
  }

  // Check if it's an image or a node containing image data
  if (node.type === 'RECTANGLE' || node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
    const fills = (node as GeometryMixin).fills as Paint[];
    if (fills && fills[0].type === 'IMAGE') {
      const imageHash = fills[0].imageHash;
      if (imageHash) {
        const imageByHash = figma.getImageByHash(imageHash);
        if (imageByHash) {
          const imageBytes = await imageByHash.getBytesAsync();
          if (imageBytes) {
            layer.imageBytes = imageBytes;  // Store the image bytes in the layer
          } else {
            figma.notify('Error: Could not extract image)', { error: true });
          }
        }
      }
    }
  }

  // Recursively extract children if applicable (for frames, groups, etc.)
  // If it's a frame, group, or component, recursively extract its children
  if ('children' in node) {
    const childLayers: any[] = [];
    for (const child of node.children) {
      const childLayer = await extractLayers(child);
      childLayers.push(childLayer);
    }
    layer.layers = childLayers;
  }  

  return layer;
}

// Traverse the selection and extract all layers using async/await
async function extractSelectedLayers() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify('Please select one or more layers to extract.', { error: true });
    return;
  }

  for (const node of selection) {
    const extractedLayer = await extractLayers(node);
    layers.push(extractedLayer);
  }

  // Send the extracted layers to the UI
  figma.ui.postMessage(layers);
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }

  if (msg.type === 'generate') {
    try {
      await extractSelectedLayers();
    } catch (error) {
      figma.notify(`Error: ${error}`, { error: true });
    }
  }
};
