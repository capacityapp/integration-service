CREATE TABLE out_of_office_dates
(
    employeeId            NVARCHAR(36),
    email                 NVARCHAR(250),
    date                  DATE NOT NULL,
    action                NVARCHAR(250) NOT NULL
--     action 'ADD' | 'REMOVE'
);