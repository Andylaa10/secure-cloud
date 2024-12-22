FROM node:20.1 as build

WORKDIR /app

EXPOSE 3000

COPY    /secure-cloud-frontend/package*.json .

RUN npm install

COPY /secure-cloud-frontend/. ./

CMD ["npm", "run", "dev"]
