FROM node:24.10.0-alpine3.22@sha256:6ff78d6d45f2614fe0da54756b44a7c529a15ebcaf9832fab8df036b1d466e73

WORKDIR /app

COPY dist/ .

CMD ["node", "index.js"]
