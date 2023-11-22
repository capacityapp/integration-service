CREATE TABLE profiles (
    email NVARCHAR(250),
    firstName NVARCHAR(50),
    lastName  NVARCHAR(50),
    departmentCodes NVARCHAR(50),
    teamCodes NVARCHAR(50),
    jobTitleCode NVARCHAR(50),
    officeCode NVARCHAR(50),
    fteHours INT,
    utilisationTarget INT,
    qualificationDate DATE,
    chargeOutRateValue INT,
    chargeOutRateCurrency NVARCHAR(3),
    PRIMARY KEY (email)
);