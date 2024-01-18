FROM node:18

# Create app directory
WORKDIR /usr/src/app

# First get package.json and yarn.lock, this creates a cached layer so that if there are changes outside of these 2
# files, we won't have to run them again.
COPY yarn.lock package.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the app
COPY dist dist

# Copy pm2 production file for running the app
COPY production.yml .

# Expose the port that we're running on to the host
EXPOSE 3000

# Start the app in production mode
CMD ["yarn", "start-prod"]