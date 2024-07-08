#!/usr/bin/env bash

rm -rf ./node_modules
npm install
./node_modules/.bin/gulp
./node_modules/license-checker/bin/license-checker  --json --production --relativeLicensePath | grep -v "path" > dist/LICENSE.checker 
