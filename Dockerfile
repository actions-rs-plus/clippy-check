FROM node:24.14.0-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
