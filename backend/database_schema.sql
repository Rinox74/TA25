-- TA25 APP - DATABASE SCHEMA v1.0
-- Questo file contiene le istruzioni SQL per creare la struttura completa del database
-- per i sistemi supportati: MySQL, PostgreSQL, e SQL Server.
--
-- Note:
-- - Le chiavi primarie sono di tipo VARCHAR(36) per accomodare gli UUID.
-- - Le chiavi esterne usano ON DELETE CASCADE per mantenere l'integrità dei dati.
-- - La colonna 'password' è stata rinominata in 'password_hash' per chiarezza.
-- - La colonna booleana 'read' per le notifiche è stata rinominata in 'is_read'.

-- ================================================= --
-- SEZIONE 1: MySQL                                  --
-- ================================================= --

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `firstName` VARCHAR(255) NULL,
  `lastName` VARCHAR(255) NULL,
  `company` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `date` DATETIME NOT NULL,
  `location` VARCHAR(255) NULL,
  `image` MEDIUMTEXT NULL,
  `totalTickets` INT NOT NULL,
  `ticketPrice` DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `articles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NULL,
  `image` MEDIUMTEXT NULL,
  `createdAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clientName` VARCHAR(255) NULL,
  `imageUrl` MEDIUMTEXT NULL,
  `targetUrl` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `userEmail` VARCHAR(255) NULL,
  `message` TEXT NULL,
  `timestamp` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `eventId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `purchaseDate` DATETIME NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `qrCodeUrl` TEXT NULL,
  `userEmail` VARCHAR(255) NULL,
  `eventName` VARCHAR(255) NULL,
  `eventDate` DATETIME NULL,
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_notifications` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `relatedId` VARCHAR(36) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `keyName` VARCHAR(255) NOT NULL PRIMARY KEY,
  `value` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================= --
-- SEZIONE 2: PostgreSQL                             --
-- ================================================= --

CREATE TABLE IF NOT EXISTS "users" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL,
  "firstName" VARCHAR(255) NULL,
  "lastName" VARCHAR(255) NULL,
  "company" VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "location" VARCHAR(255) NULL,
  "image" TEXT NULL,
  "totalTickets" INTEGER NOT NULL,
  "ticketPrice" NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "articles" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NULL,
  "image" TEXT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "banners" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "clientName" VARCHAR(255) NULL,
  "imageUrl" TEXT NULL,
  "targetUrl" TEXT NULL
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(36) NOT NULL,
  "userEmail" VARCHAR(255) NULL,
  "message" TEXT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "fk_chat_user" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "tickets" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "eventId" VARCHAR(36) NOT NULL,
  "userId" VARCHAR(36) NOT NULL,
  "purchaseDate" TIMESTAMPTZ NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "qrCodeUrl" TEXT NULL,
  "userEmail" VARCHAR(255) NULL,
  "eventName" VARCHAR(255) NULL,
  "eventDate" TIMESTAMPTZ NULL,
  CONSTRAINT "fk_ticket_event" FOREIGN KEY("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ticket_user" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "app_notifications" (
  "id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL,
  "message" TEXT NOT NULL,
  "relatedId" VARCHAR(36) NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings" (
  "keyName" VARCHAR(255) NOT NULL PRIMARY KEY,
  "value" TEXT NULL
);


-- ================================================= --
-- SEZIONE 3: SQL Server                             --
-- ================================================= --

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [password_hash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    [firstName] NVARCHAR(255) NULL,
    [lastName] NVARCHAR(255) NULL,
    [company] NVARCHAR(255) NULL
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[events]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[events] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [date] DATETIME2 NOT NULL,
    [location] NVARCHAR(255) NULL,
    [image] NVARCHAR(MAX) NULL,
    [totalTickets] INT NOT NULL,
    [ticketPrice] DECIMAL(10, 2) NOT NULL
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[articles]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[articles] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [title] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(MAX) NULL,
    [image] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[banners] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [clientName] NVARCHAR(255) NULL,
    [imageUrl] NVARCHAR(MAX) NULL,
    [targetUrl] NVARCHAR(MAX) NULL
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_messages]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[chat_messages] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [userId] NVARCHAR(36) NOT NULL,
    [userEmail] NVARCHAR(255) NULL,
    [message] NVARCHAR(MAX) NULL,
    [timestamp] DATETIME2 NOT NULL,
    CONSTRAINT [FK_chat_messages_users] FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tickets]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[tickets] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [eventId] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [purchaseDate] DATETIME2 NOT NULL,
    [price] DECIMAL(10, 2) NOT NULL,
    [qrCodeUrl] NVARCHAR(MAX) NULL,
    [userEmail] NVARCHAR(255) NULL,
    [eventName] NVARCHAR(255) NULL,
    [eventDate] DATETIME2 NULL,
    CONSTRAINT [FK_tickets_events] FOREIGN KEY ([eventId]) REFERENCES [events]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_tickets_users] FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[app_notifications]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[app_notifications] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [type] NVARCHAR(50) NOT NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [relatedId] NVARCHAR(36) NULL,
    [is_read] BIT NOT NULL DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL
  );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[settings] (
    [keyName] NVARCHAR(255) NOT NULL PRIMARY KEY,
    [value] NVARCHAR(MAX) NULL
  );
END;