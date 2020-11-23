FROM node:12

# app directory creation
WORKDIR /usr/src/app

# set up dependensies
COPY package*.json ./

RUN npm install
# in porduction mode use
# RUN npm ci --only=production

# copy source code
COPY . .

EXPOSE 9000
CMD [ "node", "server.js" ]