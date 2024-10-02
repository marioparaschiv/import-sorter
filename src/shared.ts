import { createPrinter, NewLineKind } from 'typescript';

export const Printer = createPrinter({ newLine: NewLineKind.LineFeed });