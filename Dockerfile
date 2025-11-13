FROM node:24.11.1-alpine3.22@sha256:54dfcc1bdf72fdd7f52499abfe58278b4ed7384124aef03707c5e36a94830562

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
