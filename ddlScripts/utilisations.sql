​CREATE TABLE dbo.users_historic_utilisation (
    id INT,
    email NVARCHAR(50),
    year INT,
    fiscalYear INT,
    week INT,
    availableHours INT,
    utilisedHours INT,
    PRIMARY KEY (id)
);