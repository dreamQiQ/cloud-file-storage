/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
      {
        usePrettierrc: true,
      },
    ],
    "no-unused-vars": "off",
    "no-console": "error",
    semi: false, // 去掉结尾的分号
    singleQuote: true, // 单引号替代双引号
    trailingComma: "none", // 末尾禁止添加逗号
  },
  globals: {
    monaco: true,
    BMap: true,
    beautifier: true,
    tinymce: true,
    Vue: true,
    BMapGL: true,
  },
};
