#!/bin/bash
echo "# Compiling service tools"
# Linux x32 service tool
echo "## Compiling Linux x32"
npx nexe -i dist/runner.js -o bin/srv/linux/emapc32 -t linux-x86-12.16.2 -n emapc
# Linux x64 service tool
echo "## Compiling Linux x64"
npx nexe -i dist/runner.js -o bin/srv/linux/emapc64 -t linux-x64-12.16.2 -n emapc
# Windows x32 service tool
echo "## Compiling Windows x32"
npx nexe -i dist/runner.js -o bin/srv/win/emapc32.exe -t windows-x86-12.9.1 -n emapc
# Windows x64 service tool
echo "## Compiling Windows x64"
npx nexe -i dist/runner.js -o bin/srv/win/emapc64.exe -t windows-x64-12.9.1 -n emapc
# MacOs x64 service tool
echo "## Compiling MacOs x64"
npx nexe -i dist/runner.js -o bin/srv/macos/emapc64 -t mac-x64-12.16.2 -n emapc