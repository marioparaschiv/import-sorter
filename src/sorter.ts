import * as ts from 'typescript';
import * as vscode from 'vscode';

import { Printer } from './shared';
import Sorters from './sorters';


/**
 * Configuration interface for import sorting
 */
interface ImportSorterConfig {
	importCategoryOrder: string[];
	categorizeRelativePathImports: boolean;
	categorizeSideEffectImports: boolean;
	categoryNewLineCount: number;
	newLineCount: number;
	order: 'ascending' | 'descending';
	method: keyof typeof Sorters;
}

type SorterFunction = (file: ts.SourceFile, a: ts.ImportDeclaration, b: ts.ImportDeclaration) => number;


/**
 * Sorts imports in the given source code based on the configuration.
 * @param sourceCode - The TypeScript source code to sort imports in.
 * @returns The source code with sorted imports, or undefined if no changes were made.
 */
function sortImports(sourceCode: string): string | undefined {
	const config = getConfig();
	const file = createSourceFile(sourceCode);
	const { declarations, endOfImportsPos } = gatherImportDeclarations(file);

	if (!declarations.length) return undefined;

	const sorter = getSorter(config.method);
	if (!sorter) return undefined;

	const sortedImports = sortImportDeclarations(declarations, file, config, sorter);
	return combineImportsWithContent(sourceCode, sortedImports, endOfImportsPos, config);
}

/**
 * Retrieves the configuration for import sorting.
 * @returns The import sorter configuration.
 */
function getConfig(): ImportSorterConfig {
	const config = vscode.workspace.getConfiguration('importSorter');
	return {
		importCategoryOrder: config.get('importCategoryOrder', ['sideEffect', 'other', 'relative']),
		categorizeRelativePathImports: config.get('categorizeRelativePathImports', true),
		categorizeSideEffectImports: config.get('categorizeSideEffectImports', true),
		categoryNewLineCount: config.get('categoryNewLineCount', 1),
		newLineCount: config.get('newLineCount', 2),
		order: config.get('order', 'descending'),
		method: config.get('method', 'length')
	};
}

/**
 * Creates a temporary in-memory source file.
 * @param sourceCode - The source code to create the file from.
 * @returns The created source file.
 */
function createSourceFile(sourceCode: string): ts.SourceFile {
	return ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);
}

/**
 * Gathers all import declarations at the start of the file.
 * @param file - The source file to gather imports from.
 * @returns An object containing the array of import declarations and their end position.
 */
function gatherImportDeclarations(file: ts.SourceFile): { declarations: ts.ImportDeclaration[], endOfImportsPos: number; } {
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

	return { declarations, endOfImportsPos };
}

/**
 * Retrieves the sorter function based on the specified method.
 * @param method - The sorting method to use.
 * @returns The sorter function, or undefined if the method doesn't exist.
 */
function getSorter(method: keyof typeof Sorters): SorterFunction | undefined {
	const sorter = Sorters[method];

	if (!sorter) {
		vscode.window.showErrorMessage('Import Sorter: The configured sorting method does not exist.');
		return undefined;
	}

	return sorter;
}

/**
 * Sorts import declarations based on the configuration.
 * @param declarations - The import declarations to sort.
 * @param file - The source file containing the imports.
 * @param config - The import sorter configuration.
 * @param sorter - The function used to sort imports.
 * @returns An array of sorted import nodes.
 */
function sortImportDeclarations(
	declarations: ts.ImportDeclaration[],
	file: ts.SourceFile,
	config: ImportSorterConfig,
	sorter: SorterFunction
): ts.Node[] {
	if (config.categorizeRelativePathImports || config.categorizeSideEffectImports) {
		return categorizeSortImports(declarations, file, config, sorter);
	} else {
		return sortAllImports(declarations, file, config, sorter);
	}
}

/**
 * Categorizes and sorts import declarations.
 * @param declarations - The import declarations to categorize and sort.
 * @param file - The source file containing the imports.
 * @param config - The import sorter configuration.
 * @param sorter - The function used to sort imports.
 * @returns An array of sorted import nodes.
 */
function categorizeSortImports(
	declarations: ts.ImportDeclaration[],
	file: ts.SourceFile,
	config: ImportSorterConfig,
	sorter: SorterFunction
): ts.Node[] {
	const categories: { [key: string]: ts.ImportDeclaration[]; } = {
		other: [],
		relative: [],
		sideEffect: []
	};

	for (const node of declarations) {
		const source = node.moduleSpecifier.getText(file).replace(/['"]/g, '');
		if (!node.importClause) {
			categories.sideEffect.push(node);
		} else if (!source.startsWith('.') && !source.startsWith('/')) {
			categories.other.push(node);
		} else {
			categories.relative.push(node);
		}
	}

	Object.values(categories).forEach(category =>
		category.sort((a, b) => config.order === 'descending' ? sorter(file, b, a) : sorter(file, a, b))
	);

	return combineSortedCategories(categories, config);
}

/**
 * Combines sorted categories of imports into a single array.
 * @param categories - The categorized and sorted imports.
 * @param config - The import sorter configuration.
 * @returns An array of sorted import nodes with appropriate spacing.
 */
function combineSortedCategories(
	categories: { [key: string]: ts.ImportDeclaration[]; },
	config: ImportSorterConfig
): ts.Node[] {
	const sortedImports: ts.Node[] = [];
	const types = Object.keys(categories).sort((a, b) =>
		config.importCategoryOrder.indexOf(a) - config.importCategoryOrder.indexOf(b)
	);

	let isFirstCategory = true;

	for (const importType of types) {
		const imps = categories[importType];
		if (!imps.length) continue;

		if (!isFirstCategory) {
			sortedImports.push(...Array(config.categoryNewLineCount).fill(ts.factory.createIdentifier('\n')));
		}

		sortedImports.push(...imps);
		isFirstCategory = false;
	}

	return sortedImports;
}

/**
 * Sorts all import declarations together without categorization.
 * @param declarations - The import declarations to sort.
 * @param file - The source file containing the imports.
 * @param config - The import sorter configuration.
 * @param sorter - The function used to sort imports.
 * @returns An array of sorted import nodes.
 */
function sortAllImports(
	declarations: ts.ImportDeclaration[],
	file: ts.SourceFile,
	config: ImportSorterConfig,
	sorter: SorterFunction
): ts.Node[] {
	return [...declarations].sort((a, b) =>
		config.order === 'descending' ? sorter(file, b, a) : sorter(file, a, b)
	);
}

/**
 * Combines sorted imports with the rest of the file content.
 * @param sourceCode - The original source code.
 * @param sortedImports - The array of sorted import nodes.
 * @param endOfImportsPos - The position where the original imports end.
 * @param config - The import sorter configuration.
 * @returns The combined source code with sorted imports.
 */
function combineImportsWithContent(
	sourceCode: string,
	sortedImports: ts.Node[],
	endOfImportsPos: number,
	config: ImportSorterConfig
): string {
	const restOfContent = sourceCode.slice(endOfImportsPos).trimStart();
	const nodes = ts.factory.createNodeArray(sortedImports);
	const printed = Printer.printList(ts.ListFormat.MultiLine, nodes, createSourceFile(sourceCode));

	return printed + '\n'.repeat(config.newLineCount) + restOfContent;
}

export default sortImports;