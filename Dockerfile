# Use official Node.js LTS image
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
# RUN npm ci --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Build TypeScript
# RUN npm run build

# Production image
# FROM node:20-alpine
# WORKDIR /app

# Copy only necessary files from build stage
# COPY --from=build /app .

# Install only production dependencies
# RUN npm ci --only=production --legacy-peer-deps

# Expose Strapi port
EXPOSE 1337

# Start Strapi using the script
ENTRYPOINT ["./start-strapi"] 