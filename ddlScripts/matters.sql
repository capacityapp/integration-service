CREATE TABLE matters (
    matterNumber NVARCHAR(50),
    title NVARCHAR(MAX),
    description NVARCHAR(MAX),
    clientNumber NVARCHAR(50),
    isPrivate BIT,
    deadline DATE,
    leadEmail NVARCHAR(250),
    status NVARCHAR(50),
    teamEmails NVARCHAR(MAX),
    PRIMARY KEY (matterNumber)
);