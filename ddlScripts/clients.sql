CREATE TABLE dbo.clients (
    id INT,
    clientNumber NVARCHAR(50),
    name NVARCHAR(50),
    description NVARCHAR(250),
    teamEmails NVARCHAR(250),
    PRIMARY KEY (id)
);