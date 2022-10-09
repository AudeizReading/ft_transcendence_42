FROM node:16.17.1
# https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Uncomment for vogsphere + disable volume
# COPY package*.json ./

# Uncomment for vogsphere + disable volume
# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
# Uncomment for vogsphere + disable volume
# COPY . .

EXPOSE 8190

ADD ./node-entrypoint.sh .
ENTRYPOINT ["./node-entrypoint.sh"]
CMD [ "node", "main.js" ]
