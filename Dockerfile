# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

RUN apt-get update && apt-get install -y curl

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything else
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "app.js"]
