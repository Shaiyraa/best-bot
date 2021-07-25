FROM node:14.15.4

# Create app directory
# RUN mkdir -p /usr/src/bot
RUN mkdir /usr/src/bot
WORKDIR /usr/src/bot

# Install app dependencies
COPY ./ ./

# COPY package.json /usr/src/bot-api
RUN npm install

# EXPOSE 3000
CMD ["/bin/bash"]