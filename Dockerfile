FROM node:24.13.0-alpine3.22@sha256:6f96670faefc1ec23520ce30e453e85bfdb94a43b49b7aac2b0d3ac3a902bf2f

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
