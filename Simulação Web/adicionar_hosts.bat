@echo off
chcp 65001 >nul
REM Rode este arquivo nos COMPUTADORES CLIENTES (Windows) para que
REM "tabletop-ctic" (sem .local) aponte para o servidor.
net session >nul 2>&1
if errorlevel 1 (
    echo Solicitando permissao de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

set HOSTS=%SystemRoot%\System32\drivers\etc\hosts
findstr /c:"tabletop-ctic" "%HOSTS%" >nul 2>&1
if %errorlevel%==0 (
    echo A entrada tabletop-ctic ja existe no hosts.
) else (
    echo.>>"%HOSTS%"
    echo 192.168.0.16    tabletop-ctic>>"%HOSTS%"
    echo [OK] Entrada adicionada: 192.168.0.16  tabletop-ctic
)
ipconfig /flushdns >nul
echo Acesse: https://tabletop-ctic
pause
