#!/bin/bash

mysql -uroot -proot -e 'SET GLOBAL local_infile=1;'
mysqlsh -uroot -proot -e 'util.loadDump("docker-entrypoint-initdb.d/airport-db", {threads: 16, deferTableIndexes: "all", ignoreVersion: true})'