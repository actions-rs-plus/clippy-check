FROM node:24.7.0-alpine@sha256:be4d5e92ac68483ec71440bf5934865b4b7fcb93588f17a24d411d15f0204e4f

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
