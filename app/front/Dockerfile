FROM node:16.17.1
# https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

# Create app directory
WORKDIR /usr/src/app

EXPOSE 3000

ADD ./node-entrypoint.sh .
ENTRYPOINT ["./node-entrypoint.sh"]
CMD [ "npm", "start" ]
