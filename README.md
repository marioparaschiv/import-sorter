# Import Sorter for VSCode

[![Version](https://img.shields.io/visual-studio-marketplace/v/eternal.ts-js-import-sorter)](https://marketplace.visualstudio.com/items?itemName=eternal.ts-js-import-sorter)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/eternal.ts-js-import-sorter)](https://marketplace.visualstudio.com/items?itemName=eternal.ts-js-import-sorter)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/eternal.ts-js-import-sorter)](https://marketplace.visualstudio.com/items?itemName=eternal.ts-js-import-sorter)

Import Sorter is a powerful Visual Studio Code extension that automatically organizes and sorts your import statements in TypeScript and JavaScript files. Keep your code clean and consistent with minimal effort!

## Features

- **Automatic Import Sorting**: Sorts your imports based on customizable rules.
- **Multiple Sorting Methods**: Choose from various sorting methods including alphabetical, length, and more.
- **Customizable Categories**: Group imports into categories like side effects, third-party, and relative imports.
- **Sort on Save**: Optionally sort your imports every time you save a file.
- **Command Palette Integration**: Quickly sort imports using the VSCode command palette.
- **Language Support**: Works with TypeScript (.ts) and JavaScript (.js) files.

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install eternal.ts-js-import-sorter` to find the extension
4. Click the "Install" button, then the "Enable" button

## Usage

### Manual Sorting

1. Open a TypeScript or JavaScript file
2. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
3. Type "Sort Imports" and select the command

### Automatic Sorting on Save

Enable the `sortOnSave` option in your settings to automatically sort imports whenever you save a file.

## Configuration

You can customize the behavior of Import Sorter through VS Code settings. Here are some available options:

- `importSorter.sortOnSave`: Enable/disable automatic sorting on save (default: `false`)
- `importSorter.method`: Choose the sorting method (options: `"length"`, `"alphabetical"`, `"alphabetical-specifier"`, default: `"length"`)
- `importSorter.order`: Set the sorting order (options: `"ascending"`, `"descending"`, default: `"descending"`)
- `importSorter.newLineCount`: Set the number of newlines at the end of all imports (default: `2`)

<br />


- `importSorter.categorizeSideEffectImports`: Enable categorization for side-effect imports (default: `true`)
- `importSorter.categorizeRelativeImports`: Enable categorization for relative imports (default: `true`)
- `importSorter.categoryNewLineCount`: Set the number of newlines between categories (default: `1`)
- `importSorter.importCategoryOrder`: Set the order of import categories (default: `["sideEffect", "other", "relative"]`)

### Categorization Order

You can configure the order of import categories using the `importSorter.importCategoryOrder` setting. The default order is:

```json
"importSorter.importCategoryOrder": ["sideEffect", "other", "relative"]
```

You can rearrange these categories to suit your preferences. For example, to place relative imports first:

```json
"importSorter.importCategoryOrder": ["relative", "other", "sideEffect"]
```

> [!NOTE]
> For a full list of configuration options, check the extension settings in VS Code.

## Examples

Before sorting (Length):

```typescript
import { useState } from 'react';
import './styles.css';
import axios from 'axios';
import { API_URL } from '../constants';
import React from 'react';
```

After sorting (Length):

```typescript
import { API_URL } from '../constants';
import { useState } from 'react';
import React from 'react';
import axios from 'axios';
import './styles.css';
```

Before sorting (Length, Categorized):

```typescript
import { useState } from 'react';
import './styles.css';
import axios from 'axios';
import { API_URL } from '../constants';
import React from 'react';
```

After sorting (Length, Categorized):

```typescript
import './styles.css';

import { useState } from 'react';
import React from 'react';
import axios from 'axios';

import { API_URL } from '../constants';
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any problems or have feature requests, please file an issue on the GitHub repository.

## Links

- [GitHub Repository](https://github.com/marioparaschiv/import-sorter)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=eternal.ts-js-import-sorter)
- [Personal GitHub](https://github.com/marioparaschiv)

## License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details.

---

**Enjoy sorting your imports with ease!** 🚀