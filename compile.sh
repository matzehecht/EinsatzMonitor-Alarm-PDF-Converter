#!/bin/bash
echo "# Compiling cli tools"
# Linux x32 cli tool
echo "## Compiling Linux x32"
npx nexe -i dist/cli.js -o bin/linux/32/emapc -t linux-x32-12.16.2 -n emapc -r 'lib/pdftotext/linux/pdftotext32'
# Linux x64 cli tool
echo "## Compiling Linux x64"
npx nexe -i dist/cli.js -o bin/linux/64/emapc -t linux-x64-12.16.2 -n emapc -r 'lib/pdftotext/linux/pdftotext64'
# Windows x32 cli tool
echo "## Compiling Windows x32"
npx nexe -i dist/cli.js -o bin/win/32/emapc.exe -t windows-x32-14.5.0 -n emapc -r 'lib/pdftotext/win/pdftotext32.exe'
# Windows x64 cli tool
echo "## Compiling Windows x64"
npx nexe -i dist/cli.js -o bin/win/64/emapc.exe -t windows-x64-14.5.0 -n emapc -r 'lib/pdftotext/win/pdftotext64.exe'
# MacOs x64 cli tool
echo "## Compiling MacOs x64"
npx nexe -i dist/cli.js -o bin/macos/64/emapc -t mac-x64-14.9.0 -n emapc -r 'lib/pdftotext/mac/pdftotext64'
