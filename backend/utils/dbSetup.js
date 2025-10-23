import { query, getSql } from '../config/db.js';
import { hashPassword } from './auth.js';
import { defaultLogoBase64 } from '../assets/logo.js';

export const getSchemas = () => ({
    MYSQL: [
      "CREATE TABLE IF NOT EXISTS `users` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `email` VARCHAR(255) NOT NULL UNIQUE, `password_hash` VARCHAR(255) NOT NULL, `role` VARCHAR(50) NOT NULL, `firstName` VARCHAR(255) NULL, `lastName` VARCHAR(255) NULL, `company` VARCHAR(255) NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `events` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `title` VARCHAR(255) NOT NULL, `description` TEXT NULL, `date` DATETIME NOT NULL, `location` VARCHAR(255) NULL, `image` MEDIUMTEXT NULL, `totalTickets` INT NOT NULL, `ticketPrice` DECIMAL(10, 2) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `articles` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `title` VARCHAR(255) NOT NULL, `content` TEXT NULL, `image` MEDIUMTEXT NULL, `createdAt` DATETIME NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `banners` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `clientName` VARCHAR(255) NULL, `imageUrl` MEDIUMTEXT NULL, `targetUrl` TEXT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `chat_messages` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `userId` VARCHAR(36) NOT NULL, `userEmail` VARCHAR(255) NULL, `message` TEXT NULL, `timestamp` DATETIME NOT NULL, FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `tickets` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `eventId` VARCHAR(36) NOT NULL, `userId` VARCHAR(36) NOT NULL, `purchaseDate` DATETIME NOT NULL, `price` DECIMAL(10, 2) NOT NULL, `qrCodeUrl` TEXT NULL, `userEmail` VARCHAR(255) NULL, `eventName` VARCHAR(255) NULL, `eventDate` DATETIME NULL, FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE, FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `app_notifications` ( `id` VARCHAR(36) NOT NULL PRIMARY KEY, `type` VARCHAR(50) NOT NULL, `message` TEXT NOT NULL, `relatedId` VARCHAR(36) NULL, `is_read` TINYINT(1) NOT NULL DEFAULT 0, `createdAt` DATETIME NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
      "CREATE TABLE IF NOT EXISTS `settings` ( `keyName` VARCHAR(255) NOT NULL PRIMARY KEY, `value` TEXT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ],
    POSTGRES: [
      `CREATE TABLE IF NOT EXISTS "users" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "email" VARCHAR(255) NOT NULL UNIQUE, "password_hash" VARCHAR(255) NOT NULL, "role" VARCHAR(50) NOT NULL, "firstName" VARCHAR(255) NULL, "lastName" VARCHAR(255) NULL, "company" VARCHAR(255) NULL )`,
      `CREATE TABLE IF NOT EXISTS "events" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "title" VARCHAR(255) NOT NULL, "description" TEXT NULL, "date" TIMESTAMPTZ NOT NULL, "location" VARCHAR(255) NULL, "image" TEXT NULL, "totalTickets" INTEGER NOT NULL, "ticketPrice" NUMERIC(10, 2) NOT NULL )`,
      `CREATE TABLE IF NOT EXISTS "articles" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "title" VARCHAR(255) NOT NULL, "content" TEXT NULL, "image" TEXT NULL, "createdAt" TIMESTAMPTZ NOT NULL )`,
      `CREATE TABLE IF NOT EXISTS "banners" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "clientName" VARCHAR(255) NULL, "imageUrl" TEXT NULL, "targetUrl" TEXT NULL )`,
      `CREATE TABLE IF NOT EXISTS "chat_messages" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "userId" VARCHAR(36) NOT NULL, "userEmail" VARCHAR(255) NULL, "message" TEXT NULL, "timestamp" TIMESTAMPTZ NOT NULL, CONSTRAINT "fk_chat_user" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE )`,
      `CREATE TABLE IF NOT EXISTS "tickets" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "eventId" VARCHAR(36) NOT NULL, "userId" VARCHAR(36) NOT NULL, "purchaseDate" TIMESTAMPTZ NOT NULL, "price" NUMERIC(10, 2) NOT NULL, "qrCodeUrl" TEXT NULL, "userEmail" VARCHAR(255) NULL, "eventName" VARCHAR(255) NULL, "eventDate" TIMESTAMPTZ NULL, CONSTRAINT "fk_ticket_event" FOREIGN KEY("eventId") REFERENCES "events"("id") ON DELETE CASCADE, CONSTRAINT "fk_ticket_user" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE )`,
      `CREATE TABLE IF NOT EXISTS "app_notifications" ( "id" VARCHAR(36) NOT NULL PRIMARY KEY, "type" VARCHAR(50) NOT NULL, "message" TEXT NOT NULL, "relatedId" VARCHAR(36) NULL, "is_read" BOOLEAN NOT NULL DEFAULT FALSE, "createdAt" TIMESTAMPTZ NOT NULL )`,
      `CREATE TABLE IF NOT EXISTS "settings" ( "keyName" VARCHAR(255) NOT NULL PRIMARY KEY, "value" TEXT NULL )`,
    ],
    SQLSERVER: [
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[users] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [email] NVARCHAR(255) NOT NULL UNIQUE, [password_hash] NVARCHAR(255) NOT NULL, [role] NVARCHAR(50) NOT NULL, [firstName] NVARCHAR(255) NULL, [lastName] NVARCHAR(255) NULL, [company] NVARCHAR(255) NULL ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[events]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[events] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [title] NVARCHAR(255) NOT NULL, [description] NVARCHAR(MAX) NULL, [date] DATETIME2 NOT NULL, [location] NVARCHAR(255) NULL, [image] NVARCHAR(MAX) NULL, [totalTickets] INT NOT NULL, [ticketPrice] DECIMAL(10, 2) NOT NULL ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[articles]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[articles] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [title] NVARCHAR(255) NOT NULL, [content] NVARCHAR(MAX) NULL, [image] NVARCHAR(MAX) NULL, [createdAt] DATETIME2 NOT NULL ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[banners] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [clientName] NVARCHAR(255) NULL, [imageUrl] NVARCHAR(MAX) NULL, [targetUrl] NVARCHAR(MAX) NULL ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_messages]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[chat_messages] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [userId] NVARCHAR(36) NOT NULL, [userEmail] NVARCHAR(255) NULL, [message] NVARCHAR(MAX) NULL, [timestamp] DATETIME2 NOT NULL, CONSTRAINT [FK_chat_messages_users] FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tickets]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[tickets] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [eventId] NVARCHAR(36) NOT NULL, [userId] NVARCHAR(36) NOT NULL, [purchaseDate] DATETIME2 NOT NULL, [price] DECIMAL(10, 2) NOT NULL, [qrCodeUrl] NVARCHAR(MAX) NULL, [userEmail] NVARCHAR(255) NULL, [eventName] NVARCHAR(255) NULL, [eventDate] DATETIME2 NULL, CONSTRAINT [FK_tickets_events] FOREIGN KEY ([eventId]) REFERENCES [events]([id]) ON DELETE CASCADE, CONSTRAINT [FK_tickets_users] FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[app_notifications]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[app_notifications] ( [id] NVARCHAR(36) NOT NULL PRIMARY KEY, [type] NVARCHAR(50) NOT NULL, [message] NVARCHAR(MAX) NOT NULL, [relatedId] NVARCHAR(36) NULL, [is_read] BIT NOT NULL DEFAULT 0, [createdAt] DATETIME2 NOT NULL ) END;`,
      `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U')) BEGIN CREATE TABLE [dbo].[settings] ( [keyName] NVARCHAR(255) NOT NULL PRIMARY KEY, [value] NVARCHAR(MAX) NULL ) END;`,
    ]
});


const getSeedData = async () => {
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 7);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 30);
    const pastDate1 = new Date(today);
    pastDate1.setDate(today.getDate() - 14);

    return {
        users: [
            { id: 'admin-demo-id', email: 'admin@demo.it', password_hash: await hashPassword('admin'), role: 'ADMIN', firstName: 'Admin', lastName: 'Demo', company: 'Demo Company' },
            { id: 'user-demo-id', email: 'user@demo.it', password_hash: await hashPassword('user'), role: 'USER', firstName: 'User', lastName: 'Demo', company: 'Demo Company' },
        ],
        events: [
            { id: 'event-01', title: 'Conferenza Tech 2024', description: 'Un evento imperdibile per tutti gli appassionati di tecnologia. Speaker di fama internazionale e workshop interattivi.', date: futureDate1, location: 'Milano Convention Center', image: 'https://picsum.photos/seed/event1/800/400', totalTickets: 100, ticketPrice: 50.00 },
            { id: 'event-02', title: 'Community Meetup & Networking', description: 'Incontra gli altri membri della community, scambia idee e crea nuove sinergie. Aperitivo incluso!', date: futureDate2, location: 'Spazio Copernico, Roma', image: 'https://picsum.photos/seed/event2/800/400', totalTickets: 50, ticketPrice: 15.50 },
            { id: 'event-03', title: 'Workshop Sviluppo Web', description: 'Un workshop intensivo di due giorni sulle ultime tecnologie del web development. Posti limitati.', date: pastDate1, location: 'Talent Garden, Torino', image: 'https://picsum.photos/seed/event3/800/400', totalTickets: 20, ticketPrice: 250.00 },
        ],
        articles: [
            { id: 'article-01', title: 'Le 5 Tendenze AI del Prossimo Anno', content: 'L\'intelligenza artificiale sta evolvendo a un ritmo senza precedenti...', image: 'https://picsum.photos/seed/article1/800/400', createdAt: new Date() },
            { id: 'article-02', title: 'Guida Completa al Lavoro da Remoto Efficace', content: 'Il lavoro da remoto è qui per restare...', image: 'https://picsum.photos/seed/article2/800/400', createdAt: new Date(Date.now() - 86400000 * 5) },
        ],
        banners: [
            { id: 'banner-01', clientName: 'Sponsor Principale', imageUrl: 'https://picsum.photos/seed/banner1/1200/200', targetUrl: 'https://google.com' }
        ],
        settings: [
            { keyName: 'logo', value: defaultLogoBase64 },
            { keyName: 'welcomeText', value: 'Benvenuti nella Fondazione Taranto 25' },
            { keyName: 'dbType', value: 'MYSQL' },
            { keyName: 'dbHost', value: '185.221.175.33' },
            { keyName: 'dbPort', value: '3306' },
            { keyName: 'dbUser', value: 'krxrbauj_ta25' },
            { keyName: 'dbPassword', value: 'zEa4eKfhSaQRWsExjeGK' },
            { keyName: 'dbName', value: 'krxrbauj_ta25' },
        ]
    };
};

const seedTable = async (tableName, data) => {
    const finalTableName = getSql({ MYSQL: `\`${tableName}\``, POSTGRES: `"${tableName}"`, SQLSERVER: `[${tableName}]` });

    for (const item of data) {
        const columns = Object.keys(item).map(key => getSql({ POSTGRES: `"${key}"`, MYSQL: `\`${key}\``, SQLSERVER: `[${key}]`}));
        const values = Object.values(item);
        
        let paramIndex = 1;
        const placeholders = values.map(() => getSql({ POSTGRES: `$${paramIndex++}`, SQLSERVER: `@param${paramIndex++}`, DEFAULT: '?' })).join(', ');
        
        const sql = `INSERT INTO ${finalTableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await query(sql, values);
    }
};

export const setupDatabase = async () => {
    try {
        const dbType = process.env.DB_TYPE?.toUpperCase();
        if (!dbType || dbType === 'NONE') {
            console.log('No database configured, skipping setup.');
            return;
        }
        
        const checkTableSql = getSql({
            MYSQL: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '${process.env.DB_NAME}' AND table_name = 'users'`,
            POSTGRES: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')`,
            SQLSERVER: `SELECT COUNT(*) as count FROM sys.objects WHERE name = 'users' AND type = 'U'`,
        });
        
        const result = await query(checkTableSql);
        
        let tableExists = false;
        if (dbType === 'MYSQL' || dbType === 'SQLSERVER') tableExists = result[0].count > 0;
        else if (dbType === 'POSTGRES') tableExists = result[0]?.exists || false;

        if (tableExists) {
            console.log('Database tables already exist. Skipping setup.');
            return;
        }

        console.log('Database schema not found. Creating tables and seeding data...');

        const createStatements = getSchemas()[dbType];
        for (const statement of createStatements) {
            await query(statement);
        }
        console.log('Tables created successfully.');

        console.log('Seeding initial data...');
        const seedData = await getSeedData();
        await seedTable('users', seedData.users);
        await seedTable('events', seedData.events);
        await seedTable('articles', seedData.articles);
        await seedTable('banners', seedData.banners);
        await seedTable('settings', seedData.settings);
        console.log('Seeding complete. Database is ready.');

    } catch (error) {
        console.error('FATAL: An error occurred during database setup:', error);
        process.exit(1);
    }
};
