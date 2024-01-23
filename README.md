# Capacity integration container

We have produced a simple Docker container that can help you bootstrap your data integration. It takes some configuration values and handles the batching and sending of data to our API so you don’t have to write this code. Simply start the container using Docker within a Linux environment and leave it running. Now all you have to do is maintain the tables that the container reads from so that data in Capacity is up to date.


## Configuration

The configuration is supplied via a yaml file with the following properties
```
SCHEDULE_PATTERN: a cron pattern that will describe the upload schedule
SUBDOMAIN: your firm’s Capacity subdomain 
BASE_URL: we will supply this to you
API_KEY: the API key we supply to you
DB_NAME: the database name
DB_HOST: the hostname for the database

For authentication with mysql user use the following config options:

DB_USER: the database username that you wish the integration service to use
DB_PWD: the password for this database user

For authentication with Microsoft Active AD use the following config options:

AZURE_USER_NAME: the username of the database access user from azure portal
AZURE_PASSWORD: the password of the database access user from azure portal
AZURE_CLIENT_ID: the client id from azure portal
AZURE_TENANT_ID: the tenant id from azure portal ( Optional )

MATTER_QUERY:  the query you wish the integration service to run in order to get matters.
               Naming should match https://swagger.capacityapp.io/swagger/#/default/post_matters
CLIENT_QUERY: the query you wish the integration service to run in order to get clients.
              Naming should match https://swagger.capacityapp.io/swagger/#/default/post_clients
PROFILE_QUERY: the query you wish the integration service to run in order to get profiles.
               Naming should match https://swagger.capacityapp.io/swagger/#/default/post_profiles
HISTORIC_UTILISATION_QUERY: the query you wish the integration service to run in order to get historic utilisation.
                            Naming should match https://swagger.capacityapp.io/swagger/#/default/post_profiles_utilisation
MATTER_BATCH_SIZE: the matter batch size, defaults to 2000 database rows
CLIENT_BATCH_SIZE: the client batch size, defaults to 2000 database rows
PROFILE_BATCH_SIZE: the profile batch size, defaults to 2000 database rows
HISTORIC_UTILISATION_BATCH_SIZE: the historic utilisation batch size, defaults to 2000 database rows
```
Make sure the queries supplied return the fields following the naming schema in https://swagger.capacityapp.io/swagger/#/.

**Note:** where the API expects arrays/lists of strings you can store a comma delimitted VARCHAR in the respective column.

Example file:
```
SCHEDULE_PATTERN=1 * * * *
SUBDOMAIN=localhost
BASE_URL=http://localhost:3000
API_KEY=abc123
DB_USER=SA
DB_PWD=qwerty12
DB_NAME=master
DB_HOST=localhost
AZURE_TENANT_ID=
AZURE_USER_NAME=
AZURE_PASSWORD=
AZURE_CLIENT_ID=
MATTER_QUERY=SELECT * from matters;
CLIENT_QUERY=SELECT * from clients;
PROFILE_QUERY=SELECT * from profiles;
HISTORIC_UTILISATION_QUERY=SELECT * from historic_utilisation;
```

## Pulling the docker container

Pull the latest image within your chosen linux environment before starting the container:
```
docker pull public.ecr.aws/b3l4d2w0/capacity-integration-service:latest
```

## Starting the docker container

To start the docker container run this command in the linux environment you want the service to run within
```
docker run --env-file {{envFile}} public.ecr.aws/b3l4d2w0/capacity-integration-service:latest
```

## Common issues

### Connecting to a localhost datasource

If you’re running your database on the same server as the container and you wish to use “localhost” or “0.0.0.0” in the hostname you’ll need to supply this flag to give the container access to the local network 
```
 --network="host"
```

### Make sure you’re using Microsoft SQL Server for your datasource

Currently we only support Microsoft SQL Server as the data source. If this is an issue please get in touch with our technical team, or alternatively implement the connection to the API yourselves.
