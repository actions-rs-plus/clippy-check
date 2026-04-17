FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
