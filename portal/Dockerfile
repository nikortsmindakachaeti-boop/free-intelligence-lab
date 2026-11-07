FROM node:22-alpine
WORKDIR /app
COPY server.mjs index.html ./
ENV NODE_ENV=production PORT=8088
USER node
EXPOSE 8088
CMD ["node", "server.mjs"]
