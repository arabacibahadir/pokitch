FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

FROM base AS worker
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src/lib/supabase ./src/lib/supabase
COPY src/storage/data.ts ./src/storage/data.ts
COPY src/utils/pokemon-species.ts ./src/utils/pokemon-species.ts
COPY src/worker ./src/worker

USER node
EXPOSE 3001
CMD ["npm", "run", "worker:start"]
