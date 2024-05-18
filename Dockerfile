
# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install any needed packages
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Define environment variable
ENV PORT=4000

# Run the application
CMD [ "node", "dist/index.js" ]
