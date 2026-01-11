# ==========================================
# Base Image: Official MySQL 8.0
# ==========================================
# We use the official image, so no manual "apt-get install mysql" is needed
FROM mysql:8.0

# ==========================================
# Environment Variables
# ==========================================
# 1. Set the root password to 'root'
ENV MYSQL_ROOT_PASSWORD=root

# 2. Create the main database automatically
ENV MYSQL_DATABASE=MediTrackDB

# ==========================================
# Configuration Fixes
# ==========================================
# Fix for Java/Hibernate "Access Denied" error.
# MySQL 8 uses a new encryption by default that older connectors don't like.
# This forces it back to the standard password method.
RUN echo "[mysqld]" >> /etc/mysql/conf.d/native_password.cnf
RUN echo "default-authentication-plugin=mysql_native_password" >> /etc/mysql/conf.d/native_password.cnf

# ==========================================
# Finalize
# ==========================================
# Expose the standard MySQL port
EXPOSE 3306