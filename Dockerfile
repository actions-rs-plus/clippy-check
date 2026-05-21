FROM node:24.16.0-alpine3.22@sha256:c9816940f650500c05edf809b298ebfcf920cfe36b8b52a1b4f8e29dbce74195

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
