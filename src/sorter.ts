import { Printer } from './shared';
import * as vscode from 'vscode';
import * as ts from 'typescript';
import Sorters from './sorters';


function sortImports(sourceCode: string): string | void {
	const config = vscode.workspace.getConfiguration('import-sorter');

	// Create a temporary in-memory source file.
	const file = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);

	// Gather all imports at the start of the file
	const declarations: ts.ImportDeclaration[] = [];

	let endOfImportsPos = 0;

	for (const statement of file.statements) {
		if (ts.isImportDeclaration(statement)) {
			declarations.push(statement);
			endOfImportsPos = statement.end;
		} else {
			break;
		}
	}

	if (!declarations.length) return;

	const categoryOrder = config.get('categoryOrder', ['sideEffect', 'other', 'relative']);
	const categorizeRelativePathImports = config.get('categorizeRelativePathImports');
	const categorizeSideEffectImports = config.get('categorizeSideEffectImports');
	const categoryNewLinesCount = config.get('categoryNewLinesCount', 1);
	const newLinesCount = config.get('newLinesCount', 2);
	const order = config.get('order', 'descending');
	const method = config.get('method', 'length');

	const sorter = Sorters[method];
	if (!sorter) {
		vscode.window.showErrorMessage('Import Sorter: The configured sorting method does not exist.');
		return;
	}

	// Categorize imports if any categorization is enabled
	const shouldCategorize = categorizeSideEffectImports || categorizeRelativePathImports;
	let sortedImports: ts.Node[] = [];

	if (shouldCategorize) {
		const categorizedImports: { [key: string]: ts.ImportDeclaration[]; } = {
			other: [],
			relative: [],
			sideEffect: []
		};

		for (const node of declarations) {
			const source = node.moduleSpecifier.getText(file).replace(/['"]/g, '');

			if (!node.importClause) {
				categorizedImports.sideEffect.push(node);
			} else if (!source.startsWith('.') && !source.startsWith('/')) {
				categorizedImports.other.push(node);
			} else {
				categorizedImports.relative.push(node);
			}
		}

		// Sort each category if enabled
		categorizedImports.other.sort((a, b) => sorter(file, a, b));
		categorizedImports.relative.sort((a, b) => sorter(file, a, b));
		categorizedImports.sideEffect.sort((a, b) => sorter(file, a, b));

		if (order === 'descending') {
			categorizedImports.other.reverse();
			categorizedImports.relative.reverse();
			categorizedImports.sideEffect.reverse();
		}

		// Combine all imports in the desired order, with newlines between non-empty categories
		const types = Object.keys(categorizedImports).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
		let isFirstCategory = true;

		for (const importType of types) {
			const imps = categorizedImports[importType];
			if (!imps.length) continue;

			if (!isFirstCategory) {
				for (let i = 0; i < categoryNewLinesCount; i++) {
					sortedImports.push(ts.factory.createIdentifier('\n'));
				};
			}

			sortedImports.push(...imps);
			isFirstCategory = false;
		}
	} else {
		// If no categorization is enabled, sort all imports together
		sortedImports = [...declarations].sort((a, b) => sorter(file, a, b));
		if (order === 'descending') sortedImports.reverse();
	}

	// Get the rest of the file content not including our re-ordered imports
	const restOfContent = sourceCode.slice(endOfImportsPos).trimStart();

	// Print our re-ordered imports
	const nodeArray = ts.factory.createNodeArray(sortedImports);
	const printedImports = Printer.printList(ts.ListFormat.MultiLine, nodeArray, file);

	// Combine sorted imports with the rest of the file content
	return printedImports + '\n'.repeat(newLinesCount) + restOfContent;
}

export default sortImports;