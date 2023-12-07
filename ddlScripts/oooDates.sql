CREATE TABLE out_of_office_dates
(
    employeeId            NVARCHAR(64) NOT NULL,
    email                 NVARCHAR(250) NOT NULL,
    date                  DATE NOT NULL,
    action                NVARCHAR(250) NOT NULL
--     action 'ADD' | 'REMOVE' | 'UPDATE'
);