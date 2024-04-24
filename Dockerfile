FROM node:20.12.2-alpine3.18@sha256:142644a60c2fd7b954d7de9dd3f2aba0ce9c99b14ce354ee2e65b47ee36f6baf

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
