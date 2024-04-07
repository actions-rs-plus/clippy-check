FROM node:20-alpine3.18@sha256:3fb85a68652064ab109ed9730f45a3ede11f064afdd3ad9f96ef7e8a3c55f47e

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
