# hate-bot — Railway-compatible
FROM node:20-alpine

WORKDIR /app

# Install deps first for layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Then source
COPY src/ ./src/

ENV NODE_ENV=production
ENV PORT=3001

# State file persists in working dir; Railway volume mount recommended for it
# but for week-1 the bot is fine starting fresh on each deploy
EXPOSE 3001

CMD ["node", "src/server.js"]
