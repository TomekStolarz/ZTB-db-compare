FROM mysql:8.0.36-debian

ENV MYSQL_ROOT_PASSWORD: root
ENV MYSQL_USER: dbuser
ENV MYSQL_PASSWORD: dbpass


# Install wget to download files
RUN apt-get update && apt-get install -y wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download SQL dump files
RUN wget -O airport-db.tar.gz https://downloads.mysql.com/docs/airport-db.tar.gz

# Extract SQL dump files
RUN tar xvzf airport-db.tar.gz -C /docker-entrypoint-initdb.d/

# Remove downloaded files
RUN rm airport-db.tar.gz

RUN apt-get update && apt-get install -y telnetd

# Expose Telnet port
EXPOSE 23
EXPOSE 3306
# Start Telnet service
COPY sql_seed.sh /docker-entrypoint-initdb.d
RUN ["chmod", "+x", "/docker-entrypoint-initdb.d/sql_seed.sh"]

# ENTRYPOINT ["sh" ,"-c" ,"/scripts/commands.sh"]