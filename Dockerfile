FROM node:slim

MAINTAINER ShawnZhong <public@shawnzhong.com>

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]