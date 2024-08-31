FROM node:20.17.0-alpine

WORKDIR /usr/src/api

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
