# Use the official Node.js image as the base
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first (this helps with caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 8000 for the app
EXPOSE 5000

# Start the app
CMD [ "npm", "dev" ]
