FROM node:20-alpine3.18@sha256:32ee7dfd63254de942c6621eb065b5113f5f159c7b20f5c98885f46deee54c4d

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
