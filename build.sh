#!/usr/bin/env bash

echo "... Copying and deleting last line from opena11y-evaluation-library.js ..."
cp ../evaluation-library/releases/opena11y-evaluation-library.js  temp.js
sed '$d' temp.js > content-scripts/opena11y-evaluation-library.js
rm temp.js
echo "... Creating content-script.js ..."
cat \
content-scripts/opena11y-evaluation-library.js \
content-scripts/evaluate.js \
content-scripts/highlight.js \
content-scripts/content.js > src/content-script.js

echo "... Creating ainspector extension ..."
web-ext build -s src -a releases --overwrite-dest
