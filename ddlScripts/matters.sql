CREATE TABLE matters
(
    matterNumber NVARCHAR(50)  NOT NULL,
    title        NVARCHAR(MAX) NOT NULL,
    description  NVARCHAR(MAX),
    clientNumber NVARCHAR(50)  NOT NULL,
    isPrivate    BIT,
    deadline     DATE,
    leadEmail    NVARCHAR(250),
    status       NVARCHAR(50),
-- comma delimited list of emails
    teamEmails   NVARCHAR(MAX),
    PRIMARY KEY (matterNumber)
);