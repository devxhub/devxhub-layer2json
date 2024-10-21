/* eslint-disable @typescript-eslint/no-explicit-any */
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

const layers: any[] = [];

// Function to extract all layers, recursively traversing child layers
function extractLayers(node: SceneNode) {
  const layer: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  };

  // If it's a text node, extract text-specific properties
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    layer.characters = textNode.characters;
    layer.fontSize = textNode.fontSize;
    layer.fontName = textNode.fontName;
    layer.fills = textNode.fills;
    layer.effects = textNode.effects;
    layer.strokes = textNode.strokes;
  }
  // If it's a rectangle node, extract rectangle-specific properties
  if (node.type === 'RECTANGLE') {
    const rectangleNode = node as RectangleNode;
    layer.fills = rectangleNode.fills;
    layer.strokes = rectangleNode.strokes;
    layer.effects = rectangleNode.effects;
  }
  // If it's an ellipse node, extract ellipse-specific properties
  if (node.type === 'ELLIPSE') {
    const ellipseNode = node as EllipseNode;
    layer.fills = ellipseNode.fills;
    layer.strokes = ellipseNode.strokes;
    layer.effects = ellipseNode.effects;
  }
  // If it's a line node, extract line-specific properties
  if (node.type === 'LINE') {
    const lineNode = node as LineNode;
    layer.strokes = lineNode.strokes;
  }
  // If it's a vector node, extract vector-specific properties
  if (node.type === 'VECTOR') {
    const vectorNode = node as VectorNode;
    layer.fills = vectorNode.fills;
    layer.strokes = vectorNode.strokes;
    layer.effects = vectorNode.effects;
  }
  
  // If it's a frame, group, or component, recursively extract its children
  if ('children' in node) {
    const childLayers: any[] = [];
    node.children.forEach((child) => {
      const childLayer = extractLayers(child);
      childLayers.push(childLayer);
    });
    layer.children = childLayers;
  }

  return layer;
}

// Traverse the selection and extract all layers
figma.currentPage.selection.forEach((node) => {
  const extractedLayer = extractLayers(node);
  layers.push(extractedLayer);
});

// Output the layers
console.log(layers);

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
