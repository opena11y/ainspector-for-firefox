#!/usr/bin/env bash

echo "... Copying ainspector-content-script.js ..."
cp ../evaluation-library/releases/ainspector-content-script.js src

echo "... Creating ainspector extension ..."
web-ext build -s src -a releases --overwrite-dest
