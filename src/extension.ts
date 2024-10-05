import { WorkspaceEdit, TextEdit } from 'vscode';
import * as vscode from 'vscode';

import { SUPPORTED_LANGUAGES } from './constants';
import sortImports from './sorter';


/**
 * Activates the extension.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('importSorter.sortImports', handleSortImportsCommand),
		vscode.workspace.onDidSaveTextDocument(handleSaveDocument)
	);
}

/**
 * Handles the sortImports command.
 */
async function handleSortImportsCommand(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('Import Sorter: No active text editor.');
		return;
	}

	const document = editor.document;
	if (!isSupportedLanguage(document.languageId)) {
		vscode.window.showErrorMessage('Import Sorter: This language is not supported.');
		return;
	}

	const text = document.getText();
	const sortedText = sortImports(text);
	if (!sortedText) return;

	await applyTextEdit(editor, text, sortedText);
}

let isSaving = false;

/**
 * Handles the document save event.
 * @param document The saved document
 */
async function handleSaveDocument(document: vscode.TextDocument): Promise<void> {
	if (isSaving || !isSupportedLanguage(document.languageId)) return;

	const config = vscode.workspace.getConfiguration('importSorter');
	if (!config.get('sortOnSave')) return;

	const sourceCode = document.getText();
	const sortedCode = sortImports(sourceCode);
	if (!sortedCode) return;

	isSaving = true;
	await applyWorkspaceEdit(document, sourceCode, sortedCode);
	await document.save();
	isSaving = false;
}

/**
 * Checks if the given language is supported.
 * @param languageId The language identifier
 * @returns True if the language is supported, false otherwise
 */
function isSupportedLanguage(languageId: string): boolean {
	return SUPPORTED_LANGUAGES.includes(languageId);
}

/**
 * Applies a text edit to the given editor.
 * @param editor The text editor
 * @param oldText The old text
 * @param newText The new text
 */
async function applyTextEdit(editor: vscode.TextEditor, oldText: string, newText: string): Promise<void> {
	const fullRange = new vscode.Range(
		editor.document.positionAt(0),
		editor.document.positionAt(oldText.length)
	);

	await editor.edit(editBuilder => {
		editBuilder.replace(fullRange, newText);
	});
}

/**
 * Applies a workspace edit to the given document.
 * @param document The text document
 * @param oldText The old text
 * @param newText The new text
 */
async function applyWorkspaceEdit(document: vscode.TextDocument, oldText: string, newText: string): Promise<void> {
	const start = document.positionAt(0);
	const end = document.positionAt(oldText.length);
	const range = new vscode.Range(start, end);

	const edit = new TextEdit(range, newText);
	const workspaceEdit = new WorkspaceEdit();
	workspaceEdit.set(document.uri, [edit]);

	await vscode.workspace.applyEdit(workspaceEdit);
}