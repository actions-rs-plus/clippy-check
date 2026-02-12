FROM node:24.13.1-alpine3.22@sha256:d28696cabe6a72c5addbb608b344818e5a158d849174abd4b1ae85ab48536280

WORKDIR /app

COPY dist/ .

USER clippy

CMD ["node", "index.js"]
