FROM node:24.8.0-alpine3.22@sha256:3e843c608bb5232f39ecb2b25e41214b958b0795914707374c8acc28487dea17

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
