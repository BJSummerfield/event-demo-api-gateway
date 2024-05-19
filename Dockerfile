# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install the dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN pnpm build

# Expose the port the app runs on
EXPOSE 4000

# Define the command to run the app
CMD ["pnpm", "start"]
