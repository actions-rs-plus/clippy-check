FROM node:24.9.0-alpine3.22@sha256:b0d33ed19a912e1a18ceb83e139815233cd49c123fe025e67a7c506c93e3f728

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
