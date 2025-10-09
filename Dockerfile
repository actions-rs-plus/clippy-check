FROM node:24.9.0-alpine3.22@sha256:f8baf2c963e3bff767993135ae3447bb433e8d64a5e4bb65780cd29ef3a525c2

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
