FROM node:24-bookworm-slim 

COPY . /app

RUN cd /app \
    && yarn install \
    && cd /app/apps/web \
    && yarn install

WORKDIR /app/apps/web

RUN yarn run build

CMD ["yarn", "next", "start"]