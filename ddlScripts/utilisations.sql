CREATE TABLE historic_utilisation
(
    email          NVARCHAR(250) NOT NULL,
    year           INT           NOT NULL,
-- This will decide whether the week should be included in the year-to-date average utilisation calculation. If null we
-- use the calendar year.
    fiscalYear     INT,
    week           INT           NOT NULL,
    availableHours INT           NOT NULL,
    utilisedHours  INT           NOT NULL,
);