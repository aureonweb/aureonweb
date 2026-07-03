@echo off
title Vida ZhiNeng QiGong - Servidor local
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto NONODE

echo.
echo  Iniciando el servidor local...
echo  Se abrira tu navegador en unos segundos.
echo  (Deja esta ventana abierta mientras usas el sitio.)
echo.
node "%~dp0servidor-local.cjs"
echo.
echo  El servidor se detuvo.
pause
exit /b

:NONODE
echo.
echo  ============================================================
echo   Falta Node.js (es gratis y solo se instala una vez).
echo  ============================================================
echo    1) Entra a:  https://nodejs.org
echo    2) Descarga la version "LTS" e instalala.
echo    3) Vuelve a abrir este archivo (Ver-Sitio-Local.bat).
echo  ============================================================
echo.
pause
exit /b
