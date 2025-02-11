# Use official PHP Apache image
FROM php:8.2-apache

# Allow Apache to listen on Cloud Run port
ENV PORT=8080

# Update Apache config to use the Cloud Run PORT
RUN sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
RUN sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Set Apache VirtualHost dynamically
RUN echo "<VirtualHost *:${PORT}>\n\
    DocumentRoot /var/www/html\n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog /var/log/apache2/error.log\n\
    CustomLog /var/log/apache2/access.log combined\n\
</VirtualHost>" > /etc/apache2/sites-available/000-default.conf

# Enable mod_rewrite for better routing
RUN a2enmod rewrite

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Expose the Cloud Run port
EXPOSE ${PORT}

# Start Apache server
CMD ["apache2-foreground"]
