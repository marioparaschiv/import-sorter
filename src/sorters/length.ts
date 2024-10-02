import type { ImportDeclaration, SourceFile } from 'typescript';

function sortByLengthAscending(file: SourceFile, first: ImportDeclaration, second: ImportDeclaration) {
	const lengthA = first.getWidth(file);
	const lengthB = second.getWidth(file);

	return lengthA - lengthB;
};

export default sortByLengthAscending;