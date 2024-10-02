import * as vscode from 'vscode';

export default class SortProvider implements vscode.CodeActionProvider {
	public static readonly sortImportsCodeActionKind = vscode.CodeActionKind.Refactor.append('sortImports');

	public static metadata: vscode.CodeActionProviderMetadata = {
		providedCodeActionKinds: [SortProvider.sortImportsCodeActionKind],
	};

	public async provideCodeActions(
		document: vscode.TextDocument,
		_range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		_token: vscode.CancellationToken,
	): Promise<vscode.CodeAction[]> {
		// if (!context.only) {
		// 		return [];
		// }

		// if (!context.only.contains(FixAllProvider.fixAllCodeActionKind)
		// 		&& !FixAllProvider.fixAllCodeActionKind.contains(context.only)
		// ) {
		// 		return [];
		// }

		// if (!shouldBeLinted(document)) {
		// 		return [];
		// }

		// const fixAllAction = await getTsLintFixAllCodeAction(document);
		// if (!fixAllAction) {
		// 		return [];
		// }

		return [{
			// ...fixAllAction,
			title: 'Import Sorter: Sort Imports',
			kind: SortProvider.sortImportsCodeActionKind,
		}];
		// return [{
		// 	...fixAllAction,
		// 	title: 'Fix All TSLint',
		// 	kind: FixAllProvider.fixAllCodeActionKind,
		// }];
	}
}