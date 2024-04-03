CREATE KEYSPACE airportdb WITH REPLICATION = { 
   'class' : 'SimpleStrategy', 
   'replication_factor' : 1 
  };
USE airportdb;
CREATE TABLE airline (
  airline_id smallint PRIMARY KEY,
  iata varchar,
  airlinename varchar,
  base_airport smallint
) ;

COPY airline (airline_id, iata, airlinename, base_airport)  
FROM 'airline.csv' WITH DELIMITER = ';';

CREATE TABLE airplane (
  airplane_id int  PRIMARY KEY,
  capacity int,
  type_id int,
  airline_id int
) ;

COPY airplane (airplane_id, capacity, type_id, airline_id)  
FROM 'airplane.csv' WITH DELIMITER = ';';

CREATE TABLE airplane_type (
  type_id int PRIMARY KEY,
  identifier varchar,
  description text
) ;

COPY airplane_type (type_id, identifier, description)  
FROM 'airplane_type.csv' WITH DELIMITER = ';';

CREATE TABLE airport (
  airport_id smallint PRIMARY KEY,
  iata varchar,
  icao varchar,
  name varchar
);

COPY airport (airport_id, iata, icao, name)  
FROM 'airport.csv' WITH DELIMITER = ';';

CREATE TABLE airport_geo (
  airport_id smallint,
  name varchar,
  city varchar,
  country varchar,
  latitude decimal,
  longitude decimal,
) ;

COPY airport_geo (airport_id, name, city, country, latitude, longitude)  
FROM 'airport_geo.csv' WITH DELIMITER = ';';

CREATE TABLE airport_reachable (
  airport_id smallint PRIMARY KEY,
  hops int
) ;

COPY airport_reachable (airport_id, hops)  
FROM 'airport_reachable.csv' WITH DELIMITER = ';';

CREATE TABLE booking (
  booking_id int PRIMARY KEY,
  flight_id int,
  seat varchar,
  passenger_id int,
  price decimal
) ;

COPY booking (booking_id, flight_id, seat, passenger_id, price)  
FROM 'booking.csv' WITH DELIMITER = ';';

CREATE TABLE employee (
  employee_id int PRIMARY KEY,
  firstname varchar,
  lastname varchar,
  birthdate date,
  sex varchar,
  street varchar,
  city varchar,
  zip smallint,
  country varchar,
  emailaddress varchar,
  telephoneno varchar,
  salary decimal,
  department varchar,
  username varchar,
  password varchar
) ;

COPY employee (employee_id, firstname, lastname, birthdate, sex, street, city, zip, country, emailaddress, telephoneno, salary, department, username, password)  
FROM 'employee.csv' WITH DELIMITER = ';';

CREATE TABLE flight (
  flight_id int PRIMARY KEY,
  flightno varchar,
  from smallint,
  to smallint,
  departure date,
  arrival date,
  airline_id smallint,
  airplane_id int
) ;

COPY flight (flight_id, flightno, from, to, departure, arrival, airline_id, airplane_id)  
FROM 'flight.csv' WITH DELIMITER = ';';

CREATE TABLE flight_log (
  flight_log_id int PRIMARY KEY,
  log_date date,
  user varchar,
  flight_id int,
  flightno_old varchar,
  flightno_new varchar,
  from_old smallint,
  to_old smallint,
  from_new smallint,
  to_new smallint,
  departure_old date,
  arrival_old date,
  departure_new date,
  arrival_new date,
  airplane_id_old int,
  airplane_id_new int,
  airline_id_old smallint,
  airline_id_new smallint,
  comment varchar
) ;

COPY flight_log (flight_log_id, log_date, user, flight_id, flightno_old, flightno_new, from_old, to_old, from_new, to_new, departure_old, arrival_old, departure_new, arrival_new, password, airplane_id_old, airplane_id_new, airline_id_old, airline_id_new, comment)  
FROM 'flight_log.csv' WITH DELIMITER = ';';


CREATE TABLE flightschedule (
  flightno varchar PRIMARY KEY ,
  from smallint,
  to smallint,
  departure time,
  arrival time,
  airline_id smallint,
  monday tinyint,
  tuesday tinyint,
  wednesday tinyint,
  thursday tinyint,
  friday tinyint,
  saturday tinyint,
  sunday tinyint,
) ;

COPY flightschedule (flightno, from, to, departure, arrival, airline_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday)  
FROM 'flightschedule.csv' WITH DELIMITER = ';';


CREATE TABLE passenger (
  passenger_id int PRIMARY KEY,
  passportno varchar,
  firstname varchar,
  lastname varchar
) 

COPY passenger (passenger_id, passportno, firstname, lastname)  
FROM 'passenger.csv' WITH DELIMITER = ';';


CREATE TABLE passengerdetails (
  passenger_id int PRIMARY KEY,
  birthdate date,
  sex varchar,
  street varchar,
  city varchar,
  zip smallint,
  country varchar,
  emailaddress varchar,
  telephoneno varchar
) ;

COPY passengerdetails (passenger_id, birthdate, sex, street, city, zip, country, emailaddress, telephoneno)  
FROM 'passengerdetails.csv' WITH DELIMITER = ';';


CREATE TABLE weatherdata (
  log_date date,
  time time,
  station int,
  temp decimal,
  humidity decimal,
  airpressure decimal,
  wind decimal,
  weather varchar,
  winddirection smallint,
  PRIMARY KEY (log_date,time,station)
) ;

COPY weatherdata (log_date, time, station, temp, humidity, airpressure, wind, weather, winddirection)  
FROM 'weatherdata.csv' WITH DELIMITER = ';';
