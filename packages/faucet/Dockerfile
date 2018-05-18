FROM melonproject/installer:latest AS installer

# -----------------------------------------------------------------------------
# development
# -----------------------------------------------------------------------------
FROM node:9.7.0-alpine as development
WORKDIR /app/packages/faucet

COPY --from=installer /app/node_modules /app/node_modules
COPY --from=installer /app/packages/faucet/node_modules /app/packages/faucet/node_modules

CMD ["yarn", "dev"]

# -----------------------------------------------------------------------------
# build
# -----------------------------------------------------------------------------
FROM development as build

COPY . /app
RUN yarn build

# -----------------------------------------------------------------------------
# production
# -----------------------------------------------------------------------------
FROM node:9.7.0-alpine as production
WORKDIR /app/packages/faucet

COPY --from=build /app/packages/faucet /app/packages/faucet
COPY --from=installer /app/node_modules_production /app/node_modules
COPY --from=installer /app/packages/faucet/node_modules /app/packages/faucet/node_modules

CMD ["yarn", "start"]
