echo "... Creating a11y-content-script.js ..."
cat \
content-scripts/oaa_a11y_evaluation.js \
content-scripts/oaa_a11y_rules.js \
content-scripts/oaa_a11y_rulesets.js \
content-scripts/evaluate.js \
content-scripts/highlight.js \
content-scripts/content.js > src/sidebar/a11y-content-script.js

echo "... Creating new version of ainspector extension file ..."
web-ext build -s src -a dist --overwrite-dest
