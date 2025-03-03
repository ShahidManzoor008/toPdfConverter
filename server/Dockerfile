FROM node:18

# Install LibreOffice and any required system packages
RUN apt-get update && \
    apt-get install -y libreoffice && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency manifests and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p uploads

# Expose the port that your app listens on (adjust if using a different port)
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]
