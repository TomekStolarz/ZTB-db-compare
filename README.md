# ZTB

## Cassandra seed
Download and unpack zip with csv to airportdb folder in main repo directory
Copy file airport.cql into it
run ```cd var/lib/csql && cqlsh -f airport.cql``` in docker terminal on cassandra container 


## Setup & Installation

Step 1: Clone the repository to your local machine.

```
git clone https://github.com/TomekStolarz/ZTB-db-compare.git
cd ZTB-db-compare
```

Step 2: Install the node modules.

```
npm install
```

Step 3: Start the Docker services:

```
docker-compose up
```

Step 4: Start the express app:

```
npm run start
```


## Running the App

Once the Docker containers are up, and the express app is running, the application should be available at http://localhost:5000
