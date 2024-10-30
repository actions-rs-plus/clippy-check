FROM node:20.13.1-alpine3.18@sha256:53108f67824964a573ea435fed258f6cee4d88343e9859a99d356883e71b490c

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
