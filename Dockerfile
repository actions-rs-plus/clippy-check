FROM node:24.14.0-alpine3.22@sha256:bcafe4bc8ca4901298df695837fafe2d896e2021f3a8431601ecdfe46c311880

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
