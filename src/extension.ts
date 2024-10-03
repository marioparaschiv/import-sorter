import { SUPPORTED_LANGUAGES } from './constants';
import sortImports from './sorter';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const commandDisposable = vscode.commands.registerCommand('import-sorter.sortImports', async (): Promise<void> => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('Import Sorter: No active text editor.');
			return;
		}

		const document = editor.document;

		if (!SUPPORTED_LANGUAGES.includes(document.languageId)) {
			vscode.window.showErrorMessage('Import Sorter: This language is not supported.');
			return;
		}

		const text = document.getText();
		if (!text) return;

		const sortedText = sortImports(text);
		if (!sortedText) return;

		await editor.edit(editBuilder => {
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length)
			);

			editBuilder.replace(fullRange, sortedText);
		});
	});

	context.subscriptions.push(commandDisposable);

	let isSaving = false;
	const disposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
		if (isSaving || !SUPPORTED_LANGUAGES.includes(document.languageId)) return;

		const config = vscode.workspace.getConfiguration('import-sorter');
		const sortOnSave = config.get('sortOnSave');
		if (!sortOnSave) return;

		// Get the content of the file
		const sourceCode = document.getText();

		// Run your sortImports function
		const sortedCode = sortImports(sourceCode);
		if (!sortedCode) return;

		// Apply the sorted code back to the document
		const edit = new vscode.TextEdit(new vscode.Range(document.positionAt(0), document.positionAt(sourceCode.length)), sortedCode);
		const workspaceEdit = new vscode.WorkspaceEdit();

		workspaceEdit.set(document.uri, [edit]);

		isSaving = true;
		await vscode.workspace.applyEdit(workspaceEdit);
		await document.save();
		isSaving = false;
	});

	context.subscriptions.push(disposable);
}