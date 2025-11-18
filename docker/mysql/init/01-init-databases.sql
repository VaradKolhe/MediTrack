CREATE DATABASE IF NOT EXISTS MediTrackDB;

-- Create user for the application
CREATE USER IF NOT EXISTS 'bedtracker'@'%' IDENTIFIED BY 'bedtracker123';
GRANT ALL PRIVILEGES ON MediTrackDB.* TO 'bedtracker'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use MediTrackDB for all services
USE MediTrackDB;

-- Create initial admin user (optional)
-- This will be created by the application, but we can add some initial data here if needed
