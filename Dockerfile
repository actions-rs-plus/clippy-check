FROM node:24.13.0-alpine3.22@sha256:bb089be859f2741e5ede9d85f47dc7daca754015b50e9642a7a45c5252807d2c

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
