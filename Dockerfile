FROM node:24.10.0-alpine3.22@sha256:1d8eaf99982be70694fd7913cdc6c7db20a1e2b863695c8156412899dc4368fd

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
