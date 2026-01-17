FROM mysql:8.0

# Fix auth plugin
RUN echo "[mysqld]" > /etc/mysql/conf.d/native_password.cnf \
 && echo "default-authentication-plugin=mysql_native_password" >> /etc/mysql/conf.d/native_password.cnf

EXPOSE 3306
