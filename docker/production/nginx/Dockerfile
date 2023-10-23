FROM nginx:1.25-bookworm

COPY ./docker/production/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443

CMD nginx -g 'daemon off;'