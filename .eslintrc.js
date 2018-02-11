module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    "require": false,
    "THREE": false, // not allowed to overwrite this
    // "nativePostMessage": true, // allow overwriting
  },
  extends: [
    "./eslint-rules/airbnb/best-practices.js",
    "./eslint-rules/airbnb/errors.js",
    "./eslint-rules/airbnb/style.js",
    "./eslint-rules/airbnb/variables.js",
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  // Our overrides:
  rules: {
    "wrap-iife": ["error", "inside"], // iife style following optimize-js style
    "vars-on-top": "off", // don't require var declarations at top of scope
    "no-unused-vars": ["error", {args: "none"}], // allow not using arguments to a function, like Go
    "no-param-reassign": "off", // allow reassigning passed in arguments
    "no-restricted-properties": "off", // allow Math.pow because ** is fully supported
    "quotes": ["error", "double", {avoidEscape: true}], // require double quotes except when it avoids the need to escape
    "space-before-function-paren": ["error", "never"],
    "func-names": "off", // allow unnamed functions
    "object-curly-spacing": ["error", "never"], // disallow spaces inside braces
    "space-infix-ops": "off", // let us decide how to space out operators (`x + 5*y`)
    "no-plusplus": "off", // allow ++ and -- unary operators
    "no-console": "off", // allow console
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline", // require trailing commas, just like this one
    }],
    "no-continue": "off", // allow using the continue statement
    "max-len": ["error", 180], // maximum line length
    "no-mixed-operators": "off",
    "no-prototype-builtins": "off",
    "no-underscore-dangle": "off", // allows us to use this._foo to mark as private
    "no-multi-assign": "off", // allow x = y = 5
    "quote-props": ["error", "as-needed", {keywords: false, unnecessary: false, numbers: false}],
    "yoda": ["error", "never", {exceptRange: true}], // allow `if (5 < x && x < 10)` but not `if (5 == x)`
    "newline-per-chained-call": "off",
  },
  "plugins": [
    "html",
  ],
};
