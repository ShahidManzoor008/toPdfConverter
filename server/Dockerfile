# Use an official Node.js image
FROM node:18

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project (including routes/)
COPY . .

# Expose the port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
