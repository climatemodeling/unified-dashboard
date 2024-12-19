module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
	"es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
	"allowImportExportEverywhere": true,
        "ecmaFeatures": {
             "jsx": true
	}
    },
    "plugins": [
        "react"
    ],
    "rules": {
    }
}
