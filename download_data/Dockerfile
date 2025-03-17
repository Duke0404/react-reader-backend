FROM alpine:latest

WORKDIR /downloader

# Install required system packages
RUN apk add --no-cache \
    wget \
    bash

# Copy entrypoint script into the container
COPY entrypoint.sh ./entrypoint.sh

# Give the script executable permissions
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]