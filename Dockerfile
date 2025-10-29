FROM node:24.11.0-alpine3.22@sha256:d2062677e6d878d3943bd6dd7e9790e22133d69bec957e43b0ab9f350d195968

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
