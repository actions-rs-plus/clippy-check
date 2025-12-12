FROM node:24.12.0-alpine3.22@sha256:4f4a059445c5a6ef2b9d169d9afde176301263178141fc05ba657dab1c84f9a7

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
