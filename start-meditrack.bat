@echo off
echo ======================================================
echo       STARTING MEDITRACK DOCKER ECOSYSTEM
echo ======================================================

:: 1. Create Network (Hide error if it already exists)
echo [1/5] Checking Docker Network...
docker network create meditrack-net >nul 2>&1
if %errorlevel% equ 0 (
    echo       Network 'meditrack-net' created.
) else (
    echo       Network 'meditrack-net' already exists.
)

:: 2. Stop and Remove Old Containers (To avoid conflicts)
echo [2/5] Cleaning up old containers...
docker rm -f meditrack-db >nul 2>&1
docker rm -f meditrack-backend >nul 2>&1
docker rm -f meditrack-frontend >nul 2>&1

:: 3. Start Database
echo [3/5] Starting Database (meditrack-db)...
docker run -d --name meditrack-db --network meditrack-net -p 3307:3306 meditrack-db
if %errorlevel% neq 0 goto ERROR

:: 4. Start Backend
echo [4/5] Starting Backend (meditrack-backend)...
:: Note: Ensure your image name matches 'meditrack-backend-image' or whatever you built it as.
docker run -d --name meditrack-backend --network meditrack-net -e SPRING_DATASOURCE_URL=jdbc:mysql://meditrack-db:3306/MediTrackDB -p 8761:8761 -p 8081:8081 -p 8082:8082 -p 8083:8083 meditrack-backend-image
if %errorlevel% neq 0 goto ERROR

:: 5. Start Frontend
echo [5/5] Starting Frontend (meditrack-frontend)...
docker run -d --name meditrack-frontend --network meditrack-net -p 5173:5173 meditrack-frontend-image
if %errorlevel% neq 0 goto ERROR

echo ======================================================
echo       SUCCESS! All containers are running.
echo ======================================================
echo.
docker ps
goto END

:ERROR
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo       ERROR: Something went wrong. Check above.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

:END
pause