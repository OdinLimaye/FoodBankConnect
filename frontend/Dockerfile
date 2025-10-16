# Use the official Node.js image
FROM node:20

# Set the container's working directory to app
WORKDIR /app

# For caching purposes
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the frontend source code into the container
COPY . .

# Expose React’s development server port
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
