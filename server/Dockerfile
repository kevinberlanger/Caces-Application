FROM node:22-alpine
WORKDIR /app
COPY claude-proxy.js .
ENV PORT=8787
EXPOSE 8787
CMD ["node","claude-proxy.js"]
