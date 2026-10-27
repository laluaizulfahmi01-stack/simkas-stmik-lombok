@echo off
title SIMKAS Launcher - STMIK Lombok
echo ========================================================
echo        MEMULAI SISTEM INFORMASI MANAJEMEN UKM (SIMKAS)
echo ========================================================
echo.
echo [1/2] Menjalankan Server Backend (Port 5000)...
start "SIMKAS Backend" cmd /k "cd /d "%~dp0ukm-management\backend" && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Menjalankan Frontend Web (Port 5173)...
start "SIMKAS Frontend" cmd /k "cd /d "%~dp0ukm-management\frontend" && npm run dev"

echo.
echo ========================================================
echo Aplikasi telah dijalankan!
echo Akses di Laptop : http://localhost:5173
echo Akses dari HP   : http://10.141.6.189:5173 (Satu Wi-Fi)
echo ========================================================
ping 127.0.0.1 -n 5 >nul
