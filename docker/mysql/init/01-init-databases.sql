-- Create databases for all services
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS hospital_db;
CREATE DATABASE IF NOT EXISTS admin_db;

-- Create user for the application
CREATE USER IF NOT EXISTS 'bedtracker'@'%' IDENTIFIED BY 'bedtracker123';
GRANT ALL PRIVILEGES ON user_db.* TO 'bedtracker'@'%';
GRANT ALL PRIVILEGES ON hospital_db.* TO 'bedtracker'@'%';
GRANT ALL PRIVILEGES ON admin_db.* TO 'bedtracker'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use user_db for user service
USE user_db;

-- Create initial admin user (optional)
-- This will be created by the application, but we can add some initial data here if needed
