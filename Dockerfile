FROM node:26.3.0-alpine3.22@sha256:c7932b9e5e337b0e733d6e16abc1b0e104759e8b05e59ed56586cce967d26dfe

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
