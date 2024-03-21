HOST=127.0.0.1
PORT=23

# Define command to run after connection
COMMAND_TO_RUN="./scripts/commands.sh"
sleep 10
# Execute Telnet command
{ sleep 5; echo "$COMMAND_TO_RUN"; sleep 1; } | telnet $HOST $PORT

