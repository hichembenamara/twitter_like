# Optimized for Development with Vite Dev Server & Caching
FROM node:20 

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy package definition files first for better caching
COPY package*.json ./
# If you use pnpm, copy pnpm-lock.yaml. If yarn, yarn.lock. If bun, bun.lockb.
# COPY pnpm-lock.yaml ./
# COPY bun.lockb ./

# Install dependencies using the appropriate package manager
# Ensure this matches what generated your lockfile (npm, yarn, pnpm, bun)
# Your original file used npm install --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy the rest of your application code
# In a development setup with docker-compose volumes, this copy is primarily for 
# building the initial image or for cases where volumes are not used.
# The live code will come from the volume mount.
COPY . .

# EXPOSE 5173 (this is the port Vite runs on by default with --port 5173)
# This is good practice, though docker-compose's `ports` mapping is what makes it accessible.
EXPOSE 5173

# The CMD can be defined in docker-compose.yml, which often overrides this.
# However, having a default CMD here is good practice.
# Your docker-compose uses: npm run dev -- --host --port 5173
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]