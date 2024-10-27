# DxH - Layer2JSON

**DxH - Layer2JSON** is a Figma plugin that exports design layers (text, images, shapes) as structured JSON. This plugin uses TypeScript and NPM to make development easy and streamlined.

## Getting Started

## Image Upload
To support image uploads, create a POST endpoint that accepts two properties: 
1. `uuid` (string) 
2. `image` (binary data).

In the response, return a `url` pointing to the uploaded image. Ensure that the endpoint includes the header `Access-Control-Allow-Origin: null` to handle requests from Figma, which sends `Origin: null` in the request header.

### Prerequisites
1. **Node.js** (which includes NPM) – [Download Node.js](https://nodejs.org/en/download/)
2. **TypeScript** – Install globally using:
   ```bash
   npm install -g typescript
   ```
3. **Figma Plugin Typings** – Install in the plugin directory:
   ```bash
   npm install --save-dev @figma/plugin-typings
   ```

### Setup Instructions

1. **Install Node.js and NPM**: Node.js includes NPM, which is used to manage dependencies. You can download it [here](https://nodejs.org/en/download/).
   
2. **Install TypeScript**: TypeScript allows you to add type annotations, making code easier to manage and debug.
   ```bash
   npm install -g typescript
   ```

3. **Install Figma API Type Definitions**: In your plugin directory, run the following command to get the latest Figma Plugin API typings:
   ```bash
   npm install --save-dev @figma/plugin-typings
   ```

4. **Compile TypeScript to JavaScript**: You’ll need to compile TypeScript code (`code.ts`) into JavaScript (`code.js`) for the plugin to run in Figma.

### Development

1. **Editor Recommendation**: We recommend using **Visual Studio Code** for development. Download it here: [VS Code](https://code.visualstudio.com/).
   
2. **Set up TypeScript Compilation**:
   - Open the plugin directory in Visual Studio Code.
   - Start compiling TypeScript by running the following command in VS Code:
     - **Terminal > Run Build Task...**
     - Select **npm: watch** to automatically compile on save.

### Resources

- Learn more about Figma Plugins: [Figma Plugin Quickstart Guide](https://www.figma.com/plugin-docs/plugin-quickstart-guide/)
- Learn more about TypeScript: [TypeScript Documentation](https://www.typescriptlang.org/)
