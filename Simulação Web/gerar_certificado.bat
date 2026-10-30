@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Gerando certificado HTTPS - tabletop-ctic
echo ============================================

where mkcert >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERRO] mkcert nao encontrado.
    echo Instale com:  winget install FiloSottile.mkcert
    echo Depois feche e abra este terminal e rode de novo.
    pause
    exit /b 1
)

mkcert -install

if not exist certs mkdir certs
mkcert -cert-file certs\cert.pem -key-file certs\key.pem tabletop-ctic tabletop-ctic.local 192.168.0.16 localhost 127.0.0.1

REM Copia a CA raiz para distribuir aos outros dispositivos
if not exist para_distribuir mkdir para_distribuir
for /f "delims=" %%i in ('mkcert -CAROOT') do set CAROOT_DIR=%%i
copy /y "%CAROOT_DIR%\rootCA.pem" "para_distribuir\rootCA.pem" >nul
copy /y "%CAROOT_DIR%\rootCA.pem" "para_distribuir\rootCA.crt" >nul

echo.
echo [OK] Certificado criado em: certs\
echo [OK] Arquivo para instalar nos outros dispositivos: para_distribuir\rootCA.crt
echo      (NUNCA compartilhe o arquivo rootCA-key.pem)
echo.
pause
