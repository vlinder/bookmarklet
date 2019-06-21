ROOT=$PWD/node_modules/monaco-editor/esm/vs
# Parcel options - See: https://parceljs.org/cli.html
OPTS="--no-source-maps --log-level 1 --out-dir $OUTDIR"

mkdir -p "$OUTDIR"

# Build monaco-editor.
parcel build $ROOT/language/json/json.worker.js $OPTS
parcel build $ROOT/language/css/css.worker.js $OPTS
parcel build $ROOT/language/html/html.worker.js $OPTS
parcel build $ROOT/language/typescript/ts.worker.js $OPTS
parcel build $ROOT/editor/editor.worker.js $OPTS

# Build uglify.
uglifyjs --self -o $OUTDIR/uglify.js

# Copy index.html
cp src/index.html $OUTDIR/
