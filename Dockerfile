FROM node:20.13.0-alpine3.18@sha256:fe31b16ddfb4ba4ae1a42ea540e9e44b916d754e67c64642b090839a9b2ed0ee

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
