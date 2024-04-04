FROM node:20-alpine3.18@sha256:ee64db546217ffeabd6f5258418adf8d9d3b991f3d33fe0cb9b5f149787095c1

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
