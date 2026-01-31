import { base, recommended } from '@mwlica/eslint';
import tseslint from "typescript-eslint";

export default tseslint.config(
    base,
    recommended,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
);