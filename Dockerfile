# Use official PHP Apache image
FROM php:8.2-apache

# Allow Apache to listen on any PORT provided by Cloud Run
ENV PORT=8080
RUN sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
RUN sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Set Apache VirtualHost dynamically
RUN echo '<VirtualHost *:${PORT}>\nDocumentRoot "/var/www/html"\n</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Expose the Cloud Run port
EXPOSE ${PORT}

# Start Apache server
CMD ["apache2-foreground"]
