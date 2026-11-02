@echo off
title ServiCerca
cd /d "%~dp0"
where node >nul 2>nul || (echo Necesitas instalar Node.js desde https://nodejs.org && pause && exit /b)
if not exist node_modules (echo Instalando dependencias, espera un momento... && call npm.cmd install)
call npx.cmd expo start
pause
