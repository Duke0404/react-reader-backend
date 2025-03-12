import globals from "globals"
import tseslint from "typescript-eslint"

import js from "@eslint/js"

export default tseslint.config({
	extends: [js.configs.recommended, ...tseslint.configs.recommended],
	files: ["**/*.{ts,tsx}"],
	ignores: ["dist"],
	languageOptions: {
		ecmaVersion: 2020,
		globals: globals.browser
	},
	plugins: {},
	rules: {
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "never"],
		"@typescript-eslint/no-unused-expressions": [
			"error",
			{
				allowShortCircuit: true,
				allowTernary: true,
				allowTaggedTemplates: true
			}
		]
	}
})
