FROM node:20.12.2-alpine3.18@sha256:d328c7bc3305e1ab26491817936c8151a47a8861ad617c16c1eeaa9c8075c8f6

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
