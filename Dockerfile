FROM node:20-alpine3.18@sha256:d773e394b28de6e7ecfca23ab12d66001316493286173433900365de2e34b97e

WORKDIR app

COPY dist/ .

CMD ["node", "index.js"]
