/* globals: UglifyJS */

import { editor } from "monaco-editor";

self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    switch (label) {
      case "json":
        return "./json.worker.js";
      case "css":
        return "./css.worker.js";
      case "html":
        return "./html.worker.js";
      case "typescript":
      case "javascript":
        return "./ts.worker.js";
    }
    return "./editor.worker.js";
  },
};

const monacoBaseSettings = {
  language: "javascript",
  theme: "vs-dark",
  minimap: { enabled: false },
  wordWrap: "on",
  automaticLayout: true,
  scrollBeyondLastLine: false,
};

const defaultCode = [
  "function x() {",
  '  console.log("Hello world!");',
  "}",
  "",
  "x();",
  "",
].join("\n");

const inputElement = document.querySelector("#input");
const outputElement = document.querySelector("#output");
const bookmarkletElement = document.getElementById("bookmarklet");

const minify = code =>
  UglifyJS.minify(code, {
    toplevel: true,
  });
const saveCode = code => localStorage.setItem("code", code);
const getCode = () => localStorage.getItem("code");

const inputEditor = editor.create(inputElement, {
  ...monacoBaseSettings,
  value: getCode() || defaultCode,
});
const outputEditor = editor.create(outputElement, {
  ...monacoBaseSettings,
  readOnly: true,
});

const isChecked = e => e.checked;
const querySelectorAll = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));
const maybe = x => (x === null || x === undefined ? [] : [x]);
const fromMaybe = (xM, fallback) => xM[0] || fallback;

const getOption = name =>
  fromMaybe(
    maybe(querySelectorAll(`[name=${name}]`).find(isChecked)).map(
      elem => elem.value
    ),
    ""
  );

const convert = () => {
  const inputType = getOption("inputType");
  const outputType = getOption("outputType");

  const input = inputEditor
    .getModel()
    .getLinesContent()
    .join(inputEditor.getModel().getEOL());

  // Code is the universal language.. always convert to code.
  switch (inputType) {
    //case "auto":
    case "min-code":
      // unminify
      // still technically code..
      break;
    case "bookmarklet":
      input = fromMaybe(
        maybe(input)
          .map(x => x.trimLeft())
          .map(x =>
            x.startsWith("javascript:") ? x.substr("javascript:".length) : x
          )
          .map(decodeURIComponent),
        ""
      );
      break;
    // remove javascript: and
    case "code":
      // nothing to be done.
      break;
    default:
      break;
  }

  saveCode(input);

  const minified = minify(input);
  const bookmarkletCode = "javascript:" + encodeURIComponent(minified.code);
  bookmarkletElement.href = bookmarkletCode;

  switch (outputType) {
    case "min-code":
    case "bookmarklet":
      if (minified.error) {
        output.classList.add("error");
        outputEditor.getModel().setValue(minified.error.message);
      } else {
        output.classList.remove("error");
        outputEditor
          .getModel()
          .setValue(
            outputType === "bookmarklet" ? bookmarkletCode : minified.code
          );
      }
      break;
    default:
    case "code":
      output.classList.remove("error");
      outputEditor.getModel().setValue(input);
      break;
  }
};

inputEditor.getModel().onDidChangeContent(convert);
document.getElementById("uglifyScript").onload = convert;
if (typeof UglifyJS !== "undefined") {
  convert();
}

//   TODO
// * implement code editor
//   maybe monaco? https://www.npmjs.com/package/monaco-editor'
//   maybe go back to ACE? Monaco is quite huge..
// * expose settings
// * maybe use streams for handling events, settings, rate limiting and such.
// * report issue to parcel, warnigs when bundling uglifyjs for browser since it
//   believes it has source maps.
