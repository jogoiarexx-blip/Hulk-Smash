@echo off
setlocal
cd /d "%~dp0"
title HULK - SMASH CITY v1.9
color 0A
echo ========================================
echo         HULK - SMASH CITY
 echo ========================================
echo.
where node >nul 2>nul
if %errorlevel% equ 0 (
  echo Iniciando servidor em Node.js...
  start "Servidor Hulk - NAO FECHE DURANTE O JOGO" cmd /k "node server.cjs"
  goto :openBrowser
)
where py >nul 2>nul
if %errorlevel% equ 0 (
  echo Iniciando servidor em Python...
  start "Servidor Hulk - NAO FECHE DURANTE O JOGO" cmd /k "py -m http.server 8783 --bind 127.0.0.1"
  goto :openBrowser
)
where python >nul 2>nul
if %errorlevel% equ 0 (
  echo Iniciando servidor em Python...
  start "Servidor Hulk - NAO FECHE DURANTE O JOGO" cmd /k "python -m http.server 8783 --bind 127.0.0.1"
  goto :openBrowser
)
echo Node.js ou Python nao encontrados.
echo Para iniciar corretamente, instale Node.js: https://nodejs.org/
echo Abrir index.html diretamente nao funciona com os modulos do jogo.
pause
exit /b
:openBrowser
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8783"
echo.
echo Servidor iniciado em outra janela.
echo Mantenha a janela do servidor aberta enquanto jogar.
echo O Three.js precisa de internet para carregar.
echo ATENCAO: esta versao usa a porta 8783 para evitar abrir o servidor antigo.
pause
