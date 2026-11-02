@echo off
title ServiCerca (tunel)
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo Necesitas instalar Node.js desde https://nodejs.org && pause && exit /b)
if not exist node_modules (echo Instalando dependencias, espera un momento... && call npm.cmd install)
call npx.cmd expo start --tunnel ngrok
pause
