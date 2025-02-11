# Use official PHP Apache image
FROM php:8.1-apache

# Set Apache to listen on port 8080
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf
RUN sed -i 's/:80/:8080/g' /etc/apache2/sites-available/000-default.conf

# Verify Apache is listening on port 8080
RUN cat /etc/apache2/ports.conf && cat /etc/apache2/sites-available/000-default.conf

# Copy project files to Apache root directory
COPY . /var/www/html/

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start Apache server with debugging
CMD apachectl -D FOREGROUND
