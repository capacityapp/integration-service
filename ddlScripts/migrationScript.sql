ALTER TABLE profiles ADD deactivated BIT NOT NULL DEFAULT 0;
ALTER TABLE clients ADD archived BIT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD employeeId NVARCHAR(36) NULL;
