@echo off
cd /d "%~dp0"
title HATE local server
echo.
echo  ====================================
echo    $HATE -- local dev server
echo  ====================================
echo.
echo   Open this in your browser:
echo.
echo     http://localhost:8000
echo.
echo   Stop the server: Ctrl+C, then close this window
echo.
echo  ------------------------------------
echo.

REM try python (most common)
where python >nul 2>&1
if %errorlevel% equ 0 (
    python -m http.server 8000
    goto :end
)

REM try Windows py launcher
where py >nul 2>&1
if %errorlevel% equ 0 (
    py -m http.server 8000
    goto :end
)

REM try node + npx serve
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo [serving via npx serve -- first run will download the package]
    npx --yes serve -l 8000 .
    goto :end
)

echo.
echo  Could not find Python or Node on your PATH.
echo.
echo  Install one of these (either works):
echo    Python:  https://python.org/downloads/
echo    Node:    https://nodejs.org/
echo.
echo  Then double-click this file again.
echo.
pause

:end
