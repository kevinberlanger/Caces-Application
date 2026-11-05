FROM node:22-alpine
WORKDIR /app
COPY caces-server.js .
ENV PORT=8787 DATA_DIR=/data
VOLUME /data
EXPOSE 8787
CMD ["node","caces-server.js"]
