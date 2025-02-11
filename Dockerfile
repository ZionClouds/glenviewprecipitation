# Use official PHP Apache image
FROM php:8.2-apache

# Allow Apache to listen on any PORT provided by Cloud Run
ENV PORT=8080
RUN sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
RUN sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Set Apache VirtualHost dynamically
RUN echo '<VirtualHost *:${PORT}>\n\
    DocumentRoot "/var/www/html"\n\
    <Directory "/var/www/html">\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite headers

# Expose the Cloud Run port
EXPOSE ${PORT}

# Start Apache server
CMD ["apache2-foreground"]
