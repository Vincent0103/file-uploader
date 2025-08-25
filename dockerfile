# Use Debian-based Node image with OpenSSL 3.x support
FROM node:18-bullseye

# Install OpenSSL 3.x
RUN apt-get update && \
    apt-get install -y openssl && \
    openssl version

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port Railway will bind to
EXPOSE 3000

# Start the app
CMD ["npm", "start"]