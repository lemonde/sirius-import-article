module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    allowImportExportEverywhere: true,
  },
}
