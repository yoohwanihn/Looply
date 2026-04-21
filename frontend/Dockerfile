# =============================================
# React 19.2.x / Vite 8.x / Node.js 22 LTS
# =============================================

# ── 개발 단계 (HMR) ────────────────────────
FROM node:22-alpine AS dev
WORKDIR /workspace

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── 빌드 단계 ──────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /workspace

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ── 프로덕션 단계 (Nginx) ───────────────────
FROM nginx:alpine AS prod

COPY --from=builder /workspace/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
