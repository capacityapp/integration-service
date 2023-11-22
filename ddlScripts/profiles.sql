CREATE TABLE dbo.profiles (
    id INT,
    email NVARCHAR(50),
    firstName NVARCHAR(50),
    lastName  NVARCHAR(50),
    departmentCodes NVARCHAR(250),
    teamCodes NVARCHAR(250),
    jobTitleCode NVARCHAR(50),
    officeCode NVARCHAR(50),
    fteHours INT,
    utilisationTarget INT,
    qualificationDate DATE,
    chargeOutRateValue INT,
    chargeOutRateCurrency NVARCHAR(50),
    PRIMARY KEY (id)
);