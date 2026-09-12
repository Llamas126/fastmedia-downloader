# FastMedia Downloader - Nginx para el API Gateway.
#
# Subdominio API.QBITSGLOBAL.COM (proxied por Cloudflare -> VPS).
# Expone el API Gateway (127.0.0.1:8000): /health, /api/v1/info,
# /api/v1/downloads y el stream del archivo final.
#
# Instalacion:
#   sudo cp deploy/production/nginx/api.qbitsglobal.com /etc/nginx/sites-available/
#   sudo ln -s /etc/nginx/sites-available/api.qbitsglobal.com /etc/nginx/sites-enabled/
#   sudo nginx -t && sudo systemctl reload nginx
#   sudo certbot --nginx -d api.qbitsglobal.com --email admin@qbitsglobal.com --agree-tos --redirect

server {
    listen 80;
    listen [::]:80;
    server_name api.qbitsglobal.com;

    server_tokens off;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Stream del archivo final: sin buffering, compresion ni timeouts cortos.
    location ~ "^/api/v1/downloads/[a-f0-9]{32}/file$" {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        client_max_body_size 64k;
    }

    # Resto del API (metadata, alta y consulta de descargas, health).
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 64k;
    }
}