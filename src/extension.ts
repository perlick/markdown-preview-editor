import * as vscode from 'vscode';
import { ClassicEditorProvider } from './classicEditor';

export function activate(context: vscode.ExtensionContext) {

	// Register our custom editor providers
	context.subscriptions.push(ClassicEditorProvider.register(context));
}

// this method is called when your extension is deactivated
export function deactivate() {}
