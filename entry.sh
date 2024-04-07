echo "Retrieving the IP address of cassandra..."
CASSANDRA_HOST_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ztb-db-compare-cassandra-1)
echo "Ip of cassandra is: $CASSANDRA_HOST_IP"
# Set the obtained IP address as an environment variable
export CASSANDRA_HOST_IP

# Execute the CMD
exec "$@"