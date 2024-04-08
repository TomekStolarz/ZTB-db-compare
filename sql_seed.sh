#!/bin/bash

mysql -proot -e 'SET GLOBAL local_infile=1;'
mysqlsh -proot -e 'util.loadDump("docker-entrypoint-initdb.d/airport-db", {threads: 16, deferTableIndexes: "all", ignoreVersion: true})'