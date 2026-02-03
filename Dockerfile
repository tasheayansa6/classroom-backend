# Stage 1: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine
WORKDIR /app

# Copy only the built files and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copy environment file
COPY --from=builder /app/.env ./

# Expose port
EXPOSE 4000

# Run backend
CMD ["node", "dist/index.js"]
