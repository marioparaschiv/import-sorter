import type { ImportDeclaration, SourceFile } from 'typescript';

function sortByAlphabetical(file: SourceFile, first: ImportDeclaration, second: ImportDeclaration) {
	const firstText = first.getText(file);
	const secondText = second.getText(file);

	return firstText.localeCompare(secondText);
};

export default sortByAlphabetical;