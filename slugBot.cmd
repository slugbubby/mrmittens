@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\slugBot.ps1" %*
exit /b %errorlevel%
