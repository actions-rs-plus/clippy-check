FROM node:24.14.1-alpine3.22@sha256:4f33c7804fa7775b87875f512e25e515692210bfdeafd715eb8bc441c364e2f6

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
