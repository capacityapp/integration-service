CREATE TABLE clients (
    clientNumber NVARCHAR(50),
    name NVARCHAR(50),
    description NVARCHAR(MAX),
    teamEmails NVARCHAR(MAX),
    PRIMARY KEY (clientNumber)
);