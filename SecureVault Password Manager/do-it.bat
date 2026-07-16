@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\saisu\OneDrive\Pictures\Documents\Projects\SecureVault Password Manager"

echo === Killing any backend on port 9090 ===
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":9090.*LISTENING"') do (
    taskkill /f /pid %%a 2>nul && echo Killed PID %%a
)
timeout /t 3 /nobreak >nul

echo.
echo === Building fresh jar ===
cd securevault-backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo BUILD FAILED
    cd ..
    exit /b 1
)
echo BUILD SUCCESS

echo.
echo === Starting backend ===
start "" java -jar target\securevault-backend-1.0.0.jar
cd ..
echo Waiting for backend to start...
timeout /t 12 /nobreak >nul

echo.
echo === Verifying backend is up ===
curl.exe -s -X POST http://localhost:9090/api/auth/register -H "Content-Type:application/json" -d "{\"email\":\"vtest@test.com\",\"password\":\"Test1234!\",\"name\":\"VTest\",\"pin\":\"123456\",\"phoneNumber\":\"1234567890\"}" > tmp_vr.json
set /p R=<tmp_vr.json
echo !R! | findstr "token" >nul
if !errorlevel! equ 0 (
    echo [PASS] Registration OK
) else (
    echo [FAIL] Registration: !R!
)

echo.
echo Backend is running on http://localhost:9090
echo Fresh jar built from current source with all fixes.
echo Use full-test.ps1 or manual testing to verify all 5 scenarios.
del tmp_vr.json 2>nul
endlocal
