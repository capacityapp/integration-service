CREATE TABLE clients
(
    clientNumber NVARCHAR(50) NOT NULL,
    name         NVARCHAR(50) NOT NULL,
    description  NVARCHAR(MAX),
-- comma delimited list of emails
    teamEmails   NVARCHAR(MAX),
    PRIMARY KEY (clientNumber)
);