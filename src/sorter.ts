import * as ts from 'typescript';

import * as Sorters from './sorters';
import { Printer } from './shared';

function sortImports(sourceCode: string): string {
	const file = ts.createSourceFile(
		'temp.ts',
		sourceCode,
		ts.ScriptTarget.Latest,
		true
	);

	const importNodes: ts.ImportDeclaration[] = [];
	let endOfImportsPos = 0;

	for (const statement of file.statements) {
		if (ts.isImportDeclaration(statement)) {
			importNodes.push(statement);
			endOfImportsPos = statement.end;
		} else {
			break;
		}
	}

	// Sort import nodes by line length
	importNodes.sort((a, b) => Sorters.Length(file, a, b));

	// Create a new source file with sorted imports
	const sortedImports = Printer.printList(
		ts.ListFormat.MultiLine,
		ts.factory.createNodeArray(importNodes),
		file
	);

	// Get the rest of the file content
	const restOfContent = sourceCode.slice(endOfImportsPos).trimStart();

	// Combine sorted imports with the rest of the file content
	// Ensure exactly one blank line between imports and the rest of the content
	return sortedImports + '\n\n' + restOfContent;
}

export default sortImports;