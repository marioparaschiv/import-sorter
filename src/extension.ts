import * as vscode from 'vscode';

import { SUPPORTED_LANGUAGES } from './constants';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('import-sorter.sortImports', (...args) => {
		const document = vscode.window.activeTextEditor?.document;

		if (!document) {
			return vscode.window.showErrorMessage('Import Sorter: You must be in a file to use this command.');
		}

		if (!SUPPORTED_LANGUAGES.includes(document.languageId)) {
			return vscode.window.showErrorMessage('Import Sorter: This language is not supported.');
		}

		// vscode.window.showInformationMessage('Hello World from import-sorter!');
		// vscode.window.showInformationMessage('Ext: ' + extname(document.fileName));
		// console.log(document?.fileName);
		// vscode.window.showInformationMessage('Hello World from import-sorter!');
	});

	context.subscriptions.push(disposable);
}