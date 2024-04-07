FROM delermando/docker-cassandra-web:v0.4.0

ENV CASSANDRA_PORT=9042
COPY entry.sh entry.sh

RUN chmod +x entry.sh

EXPOSE 3000