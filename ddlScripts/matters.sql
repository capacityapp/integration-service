CREATE TABLE matters (
    id INT,
    matterNumber NVARCHAR(50),
    title NVARCHAR(50),
    description NVARCHAR(250),
    clientNumber NVARCHAR(50),
    isPrivate BIT,
    deadline DATE,
    leadEmail NVARCHAR(50),
    status NVARCHAR(50),
    teamEmails NVARCHAR(250),
    PRIMARY KEY (id)
);