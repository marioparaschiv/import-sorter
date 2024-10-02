import * as vscode from 'vscode';
import * as ts from 'typescript';

import { SUPPORTED_LANGUAGES } from './constants';
import * as Sorters from './sorters';

function sortImports(sourceCode: string): string {
	const config = vscode.workspace.getConfiguration('import-sorter');

	const sourceFile = ts.createSourceFile(
		'temp.ts',
		sourceCode,
		ts.ScriptTarget.Latest,
		true
	);

	const importNodes: ts.ImportDeclaration[] = [];
	let endOfImportsPos = 0;

	for (const statement of sourceFile.statements) {
		if (ts.isImportDeclaration(statement)) {
			importNodes.push(statement);
			endOfImportsPos = statement.end;
		} else {
			break;
		}
	}


	// Sort import nodes by line length
	importNodes.sort((a, b) => Sorters.Length(sourceFile, a, b));


	if (config.get('order') === 'descending') {
		importNodes.reverse();
	}

	// Create a new source file with sorted imports
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const sortedImports = printer.printList(
		ts.ListFormat.MultiLine,
		ts.factory.createNodeArray(importNodes),
		sourceFile
	);

	// Get the rest of the file content
	const restOfContent = sourceCode.slice(endOfImportsPos).trimStart();

	// Combine sorted imports with the rest of the file content
	// Ensure exactly one blank line between imports and the rest of the content
	return sortedImports + '\n\n' + restOfContent;
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('import-sorter.sortImports', () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return vscode.window.showErrorMessage('Import Sorter: No active text editor.');
		}

		const document = editor.document;

		if (!SUPPORTED_LANGUAGES.includes(document.languageId)) {
			return vscode.window.showErrorMessage('Import Sorter: This language is not supported.');
		}

		const text = document.getText();
		const sortedText = sortImports(text);

		editor.edit(editBuilder => {
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length)
			);
			editBuilder.replace(fullRange, sortedText);
		}).then(success => {
			if (success) {
				vscode.window.showInformationMessage('Imports sorted successfully.');
			} else {
				vscode.window.showErrorMessage('Failed to sort imports.');
			}
		});
	});

	context.subscriptions.push(disposable);
}