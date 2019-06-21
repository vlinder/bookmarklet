/* globals: UglifyJS */
const ace = require("ace-builds/src-noconflict/ace.js");
const outputTheme = require("ace-builds/src-noconflict/theme-cobalt");
const inputTheme = require("ace-builds/src-noconflict/theme-monokai");
const javascriptMode = require("ace-builds/src-noconflict/mode-javascript");

const options = {
  toplevel: true,
};

const input = document.querySelector("#input");
const output = document.querySelector("#output");

const inputEditor = ace.edit("input");
const outputEditor = ace.edit("output");

console.log("input", inputEditor);
console.log("output", outputEditor);
inputEditor.setTheme(inputTheme);
outputEditor.setTheme(outputTheme);

inputEditor.session.setMode(javascriptMode);
outputEditor.session.setMode(javascriptMode);

const convert = () => {
  const minified = UglifyJS.minify(input.value, options);
  if (minified.error) {
    output.classList.add("error");
    output.value = minified.error.message;
  } else {
    output.classList.remove("error");
    output.value = minified.code;
  }
};

input.addEventListener("input", convert);

//   TODO
// * implement code editor
//   maybe monaco? https://www.npmjs.com/package/monaco-editor
// * expose settings
// * maybe use streams for handling events, settings, rate limiting and such.
// * maybe take back parcel, and run it just on this file? Getting us npm module
//   imports without any hassle.
// * report issue to parcel, warnigs when bundling uglifyjs for browser since it
//   believes it has source maps.
