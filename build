#!/usr/bin/env bash

echo "... Creating content-script.js ..."
cat \
content-scripts/oaa_a11y_evaluation.js \
content-scripts/oaa_a11y_rules.js \
content-scripts/oaa_a11y_rulesets.js \
content-scripts/evaluate.js \
content-scripts/highlight.js \
content-scripts/content.js > src/sidebar/content-script.js

echo "... Creating ainspector extension ..."
web-ext build -s src -a dist --overwrite-dest
