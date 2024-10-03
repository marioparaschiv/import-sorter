import type { ImportDeclaration, SourceFile } from 'typescript';


function sortByLengthAscending(file: SourceFile, first: ImportDeclaration, second: ImportDeclaration) {
	const lengthA = first.getWidth(file);
	const lengthB = second.getWidth(file);

	const diff = lengthA - lengthB;

	// Handle imports of the same length by sorting them alphabetically.
	if (diff === 0) {
		const contentA = first.getText(file);
		const contentB = second.getText(file);
		return contentA.localeCompare(contentB);
	}

	return diff;
};

export default sortByLengthAscending;