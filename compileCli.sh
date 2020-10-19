#!/bin/bash
echo "# Compiling cli tools"
# Linux x32 cli tool
echo "## Compiling Linux x32"
npx nexe -i dist/cli.js -o bin/cli/linux/emapc32 -t linux-x86-12.16.2 -n emapc
# Linux x64 cli tool
echo "## Compiling Linux x64"
npx nexe -i dist/cli.js -o bin/cli/linux/emapc64 -t linux-x64-12.16.2 -n emapc
# Windows x32 cli tool
echo "## Compiling Windows x32"
npx nexe -i dist/cli.js -o bin/cli/win/emapc32.exe -t windows-x86-12.9.1 -n emapc
# Windows x64 cli tool
echo "## Compiling Windows x64"
npx nexe -i dist/cli.js -o bin/cli/win/emapc64.exe -t windows-x64-12.9.1 -n emapc
# MacOs x64 cli tool
echo "## Compiling MacOs x64"
npx nexe -i dist/cli.js -o bin/cli/macos/emapc64 -t mac-x64-12.16.2 -n emapc