FROM node:14
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

# Create app directory
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/certs
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4000
EXPOSE 443
CMD [ "node", "index.js" ]
