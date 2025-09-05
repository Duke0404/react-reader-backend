# Use Node.js base image
FROM node:22

# Install OpenSSL for certificate generation
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate self-signed certificates for HTTPS
RUN mkdir -p certs && \
    openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem \
    -days 365 -nodes -subj "/C=US/ST=Dev/L=Local/O=ReactReader/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Build the TypeScript code
RUN npm run build

# Expose both HTTP and HTTPS ports
EXPOSE 3000 3443

# Start the server
CMD ["node", "dist/server.js"]