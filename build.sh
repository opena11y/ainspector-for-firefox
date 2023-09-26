#!/usr/bin/env bash

echo "... Creating ainspector extension ..."
web-ext build -s src -a releases --overwrite-dest
