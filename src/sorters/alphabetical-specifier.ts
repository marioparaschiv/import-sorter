import type { ImportDeclaration, SourceFile } from 'typescript';

function sortByAlphabeticalSpecifier(file: SourceFile, first: ImportDeclaration, second: ImportDeclaration) {
	const firstText = first.moduleSpecifier.getText(file);
	const secondText = second.moduleSpecifier.getText(file);

	return firstText.localeCompare(secondText);
};

export default sortByAlphabeticalSpecifier;