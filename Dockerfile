FROM node:20-alpine3.18

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
