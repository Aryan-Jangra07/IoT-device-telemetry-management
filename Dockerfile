FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY Backend/package*.json ./Backend/

# Install dependencies
RUN cd Backend && npm install

# Copy all backend source code
COPY Backend/ ./Backend/

# Set working directory to Backend
WORKDIR /app/Backend

# Start the application
CMD ["npm", "start"]
