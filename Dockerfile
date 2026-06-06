FROM node:24.16.0-bookworm-slim

WORKDIR /workspace

ENV npm_config_update_notifier=false

CMD ["npm", "run", "cli"]
