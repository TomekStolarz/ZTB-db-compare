# Use a base image
FROM ubuntu:latest

# Install Telnet client
RUN apt-get update && apt-get install -y telnet

COPY telnet_connct.sh /scripts/commands.sh
RUN ["chmod", "+x", "/scripts/commands.sh"]


CMD ["sh" ,"-c" ,"/scripts/commands.sh"]