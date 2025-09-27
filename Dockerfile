FROM node:24.9.0-alpine3.22@sha256:77f3c4d1f33c17dfa4af4b0add57d86957187873e313c2c37f52831d117645c8

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
