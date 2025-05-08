#!/usr/bin/env bash

rm -rf ./node_modules
npm install
./node_modules/license-checker/bin/license-checker  --json --production --relativeLicensePath | grep -v "path" > dist/LICENSE.checker 
./node_modules/.bin/gulp
npx tailwindcss -i ./assets/css/lmtstyle.css -o ./dist/css/lmtud_bundle.min.css

