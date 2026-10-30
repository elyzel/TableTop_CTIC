@echo off
chcp 65001 >nul
net session >nul 2>&1
if errorlevel 1 (
    echo Solicitando permissao de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

netsh advfirewall firewall delete rule name="Tabletop CTIC HTTPS" >nul 2>&1
netsh advfirewall firewall delete rule name="Tabletop CTIC mDNS" >nul 2>&1

netsh advfirewall firewall add rule name="Tabletop CTIC HTTPS" dir=in action=allow protocol=TCP localport=443 profile=any
netsh advfirewall firewall add rule name="Tabletop CTIC mDNS" dir=in action=allow protocol=UDP localport=5353 profile=any

echo.
echo [OK] Firewall liberado: TCP 443 (HTTPS) e UDP 5353 (mDNS).
pause
