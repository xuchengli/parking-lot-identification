FROM node
MAINTAINER li xu cheng "lixucheng@aliyun.com"

# Before webpack app in production, you can set context path using <docker build --build-arg context=[my-context-path]>
ARG context=/
ENV Context_Path $context

# Build and start up app
RUN mkdir -p /usr/app/src
COPY . /usr/app/src
WORKDIR /usr/app/src
RUN npm install && npm cache clean --force
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]