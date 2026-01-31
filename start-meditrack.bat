@echo off
echo ======================================================
echo       STARTING MEDITRACK DOCKER ECOSYSTEM
echo ======================================================

:: 1. Create Network (Hide error if it already exists)
echo [1/6] Checking Docker Network...
docker network create meditrack-net >nul 2>&1
if %errorlevel% equ 0 (
    echo       Network 'meditrack-net' created.
) else (
    echo       Network 'meditrack-net' already exists.
)

:: 2. Check and Create Volume (Persist Data)
echo [2/6] Checking Docker Volume...
:: Try to find the volume
docker volume inspect meditrack_data >nul 2>&1
if %errorlevel% neq 0 (
    echo       Volume 'meditrack_data' not found. Creating it...
    docker volume create meditrack_data
) else (
    echo       Volume 'meditrack_data' found. Keeping data safe.
)

:: 3. Stop and Remove Old Containers (To avoid conflicts)
echo [3/6] Cleaning up old containers...
docker rm -f meditrack-db >nul 2>&1
docker rm -f meditrack-backend >nul 2>&1
docker rm -f meditrack-frontend >nul 2>&1

:: 4. Start Database (WITH VOLUME)
echo [4/6] Starting Database (meditrack-db)...
:: Note: The '-v' flag mounts the volume we checked in Step 2
docker run -d --name meditrack-db --network meditrack-net -v meditrack_data:/var/lib/mysql -p 3307:3306 meditrack-db
if %errorlevel% neq 0 goto ERROR

:: 5. Start Backend
echo [5/6] Starting Backend (meditrack-backend)...
docker run -d --name meditrack-backend --network meditrack-net -e SPRING_DATASOURCE_URL=jdbc:mysql://meditrack-db:3306/MediTrackDB -p 8761:8761 -p 8081:8081 -p 8082:8082 -p 8083:8083 meditrack-backend-image
if %errorlevel% neq 0 goto ERROR

:: 6. Start Frontend
echo [6/6] Starting Frontend (meditrack-frontend)...
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