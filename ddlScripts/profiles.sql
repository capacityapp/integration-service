CREATE TABLE profiles
(
    email                 NVARCHAR(250) NOT NULL,
    firstName             NVARCHAR(50) NOT NULL,
    lastName              NVARCHAR(50) NOT NULL,
-- comma delimited list of department codes
    departmentCodes       NVARCHAR(50),
-- comma delimited list of team codes
    teamCodes             NVARCHAR(50),
    jobTitleCode          NVARCHAR(50) NOT NULL,
    officeCode            NVARCHAR(50),
    fteHours              INT,
    utilisationTarget     INT,
    qualificationDate     DATE,
    chargeOutRateValue    INT,
-- 3 letter currency code as per ISO 4217
    chargeOutRateCurrency NVARCHAR(3),
    PRIMARY KEY (email)
);