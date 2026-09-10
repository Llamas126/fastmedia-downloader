# FastMedia Downloader - Nginx para descargas directas de medios.
#
# Subdominio MEDIA.QBITSGLOBAL.COM (Nube Gris / DNS Only, sin CDN proxy de Cloudflare).
# Sirve solo el endpoint de archivo final apuntando directo al media-processor
# (127.0.0.1:8001): una sola hop, streaming sin buffer y sin timeouts de video.
#
# Instalacion:
#   sudo cp deploy/production/nginx/media.qbitsglobal.com /etc/nginx/sites-available/
#   sudo ln -s /etc/nginx/sites-available/media.qbitsglobal.com /etc/nginx/sites-enabled/
#   sudo nginx -t && sudo systemctl reload nginx
#   sudo certbot --nginx -d media.qbitsglobal.com --email admin@qbitsglobal.com --agree-tos --redirect

server {
    listen 80;
    listen [::]:80;
    server_name media.qbitsglobal.com;

    # El streaming de video/audio no debe comprimirse ni cachearse en disco.
    gzip off;
    sendfile on;
    server_tokens off;

    # Bonus: cabeceras de seguridad opcionales para el subdominio de medios.
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;

    # UNICO endpoint expuesto: archivo MP4/MP3 de un job completado.
    # /api/v1/downloads/<job_id>/file  ->  /jobs/<job_id>/file en el media-processor.
    location ~ "^/api/v1/downloads/[a-f0-9]{32}/file$" {
        rewrite "^/api/v1/downloads/([a-f0-9]{32})/file$" /jobs/$1/file break;
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }

    # Cualquier otra ruta: cerrada. No se expone /process-media, /jobs ni /health.
    location / {
        return 404;
    }
}