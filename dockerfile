FROM node:18-alpine
WORKDIR /usr/src/app
COPY . ./ 
COPY assets ./assets
RUN npm install -g http-server
EXPOSE 8080
CMD ["http-server", "-p", "8080"]