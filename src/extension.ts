import type { ExtensionContext } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

/**
 * Below is the "typical" extension.ts file that is used to activate and deactivate the extension.
 * this file as well as package.json are the two main files that are required to develop a Podman Desktop extension.
 */

// Initialize the activation of the extension.
export async function activate(extensionContext: ExtensionContext): Promise<void> {
  console.log('starting hello world extension');

  // Create a dialog that says "Hello World" with the extensionApi on load
  extensionApi.window.showInformationMessage('Hello World from the Podman Desktop Extension!');
}

// Deactivate the extension
export async function deactivate(): Promise<void> {
  console.log('stopping hello world extension');
}
