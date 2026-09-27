FROM node:14-buster

RUN sed -i 's/deb.debian.org/archive.debian.org/g; s|security.debian.org|archive.debian.org/debian-security|g' /etc/apt/sources.list

RUN apt-get update && \
    apt-get install -y --no-install-recommends default-jre && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME /usr

WORKDIR /app
RUN set -x && groupadd -r -g 888 app && \
    useradd -r -u 888 -g app -d /app app && \
    chown -R app:app /app
USER app

# Download dependencies independent of application for faster build
COPY package.json /app/
RUN npm install

# Copy application
COPY . .

USER root
RUN find /app/converter/bin -type f -exec sed -i 's/\r$//' {} \; && \
    chmod +x /app/converter/bin/*
USER app

CMD ["npm", "start"]
