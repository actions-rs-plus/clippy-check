FROM node:24.14.0-alpine3.22@sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
