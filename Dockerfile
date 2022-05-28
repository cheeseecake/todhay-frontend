# Node 17 currently doesn't work with webpack :(
FROM node:lts-alpine

WORKDIR /frontend

CMD ["npm", "start"]