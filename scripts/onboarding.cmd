@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0onboarding.ps1" %*
exit /b %errorlevel%
