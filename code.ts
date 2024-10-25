/* eslint-disable @typescript-eslint/no-explicit-any */
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

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
function extractId(id: string): string {
  const parts = id.split(':');
  return parts.length > 1 ? parts[1] : id;
}

// Helper function to generate a UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to extract all layers, recursively traversing child layers
function extractLayers(node: SceneNode) {
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
  }
  
  // If it's a frame, group, or component, recursively extract its children
  if ('children' in node) {
    const childLayers: any[] = [];
    node.children.forEach((child) => {
      const childLayer = extractLayers(child);
      childLayers.push(childLayer);
    });
    layer.layers = childLayers;
  }

  return layer;
}

// Traverse the selection and extract all layers
figma.currentPage.selection.forEach((node) => {
  const extractedLayer = extractLayers(node);
  layers.push(extractedLayer);
});

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Send the extracted layers to the UI
figma.ui.postMessage(layers);

// When the user closes the plugin, send a message to close the plugin
figma.ui.onmessage = msg => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
