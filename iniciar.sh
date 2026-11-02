#!/bin/sh
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Necesitas instalar Node.js desde https://nodejs.org"; exit 1; }
[ -d node_modules ] || npm install
npx expo start
