import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getSql } from '../config/db.js';
import { generateToken, hashPassword, comparePassword, protect, admin } from '../utils/auth.js';
import { createDynamicConnection } from '../utils/dbDynamicConnector.js';
import { getSchemas } from '../utils/dbSetup.js';


const router = express.Router();

// Helper to handle async route errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const buildUpdateQuery = async (table, id, updates) => {
    const params = [];
    let setClauses = [];

    // Whitelist columns to prevent SQL injection or unwanted updates
    const allowedColumns = {
        users: ['email', 'password_hash', 'role', 'firstName', 'lastName', 'company'],
        events: ['title', 'description', 'date', 'location', 'image', 'totalTickets', 'ticketPrice'],
        articles: ['title', 'content', 'image'],
        banners: ['clientName', 'imageUrl', 'targetUrl']
    };

    const validColumns = allowedColumns[table] || Object.keys(updates);
    const updateCopy = { ...updates };

    // Special handling for password hashing
    if (table === 'users' && updateCopy.password) {
        if (updateCopy.password.trim() === '') {
            delete updateCopy.password; // Don't process if password is empty
        } else {
            updateCopy.password_hash = await hashPassword(updateCopy.password);
            delete updateCopy.password; // Use password_hash instead
        }
    }
    
    let paramIndex = 1;
    for (const key of validColumns) {
        if (updateCopy[key] !== undefined) {
            params.push(updateCopy[key]);
            const colName = getSql({
                POSTGRES: `"${key}"`,
                MYSQL: `\`${key}\``,
                SQLSERVER: `[${key}]`,
            });
            const placeholder = getSql({
                POSTGRES: `$${paramIndex++}`,
                SQLSERVER: `@param${paramIndex++}`,
                DEFAULT: '?',
            });
            setClauses.push(`${colName} = ${placeholder}`);
        }
    }

    if (setClauses.length === 0) {
        return null;
    }

    params.push(id);
    const idPlaceholder = getSql({
        POSTGRES: `$${paramIndex++}`,
        SQLSERVER: `@param${paramIndex++}`,
        DEFAULT: '?',
    });

    const finalTableName = getSql({ MYSQL: `\`${table}\``, POSTGRES: `"${table}"`, SQLSERVER: `[${table}]` });
    const sql = `UPDATE ${finalTableName} SET ${setClauses.join(', ')} WHERE id = ${idPlaceholder}`;
    return { sql, params };
};


// --- AUTH ROUTES ---
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const sql = getSql({
        MYSQL: 'SELECT * FROM `users` WHERE `email` = ?',
        POSTGRES: 'SELECT * FROM "users" WHERE "email" = $1',
        SQLSERVER: 'SELECT * FROM [users] WHERE [email] = @param1',
    });
    const users = await query(sql, [email]);
    if (users.length > 0 && await comparePassword(password, users[0].password_hash)) {
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
}));

// --- USERS ---
router.get('/users', protect, admin, asyncHandler(async (req, res) => {
    const sql = getSql({
        MYSQL: 'SELECT `id`, `email`, `role`, `firstName`, `lastName`, `company` FROM `users`',
        POSTGRES: 'SELECT "id", "email", "role", "firstName", "lastName", "company" FROM "users"',
        SQLSERVER: 'SELECT [id], [email], [role], [firstName], [lastName], [company] FROM [users]',
    });
    const users = await query(sql);
    res.json(users);
}));

router.post('/users', protect, admin, asyncHandler(async (req, res) => {
    const { email, password, role, firstName, lastName, company } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required for new users.' });
    }
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();
    
    const sql = getSql({
        MYSQL: 'INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `firstName`, `lastName`, `company`) VALUES (?, ?, ?, ?, ?, ?, ?)',
        POSTGRES: 'INSERT INTO "users" ("id", "email", "password_hash", "role", "firstName", "lastName", "company") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        SQLSERVER: 'INSERT INTO [users] ([id], [email], [password_hash], [role], [firstName], [lastName], [company]) VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7)',
    });
    
    await query(sql, [userId, email, hashedPassword, role, firstName, lastName, company]);
    const newUser = { id: userId, email, role, firstName, lastName, company };
    res.status(201).json(newUser);
}));

router.put('/users/:id', protect, asyncHandler(async (req, res) => {
    const userIdToUpdate = req.params.id;
    const updates = req.body;

    if (req.user.id !== userIdToUpdate && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    if (updates.role && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to change user roles' });
    }
    
    const queryData = await buildUpdateQuery('users', userIdToUpdate, updates);

    if (!queryData) {
        const { password, ...otherUpdates } = updates;
        if (Object.keys(otherUpdates).length === 0) {
            return res.json({ message: 'User updated successfully' }); // Only password was sent, which is handled
        }
        return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    await query(queryData.sql, queryData.params);
    res.json({ message: 'User updated successfully' });
}));


router.delete('/users/:id', protect, admin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sql = getSql({
        MYSQL: 'DELETE FROM `users` WHERE `id` = ?',
        POSTGRES: 'DELETE FROM "users" WHERE "id" = $1',
        SQLSERVER: 'DELETE FROM [users] WHERE [id] = @param1',
    });
    await query(sql, [id]);
    res.json({ message: 'User deleted' });
}));

// --- PUBLIC ROUTES ---
router.get('/events', asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM events ORDER BY ' + getSql({ MYSQL: '`date`', POSTGRES: '"date"', SQLSERVER: '[date]' }) + ' DESC';
    const events = await query(sql);
    res.json(events);
}));

router.get('/articles', asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM articles ORDER BY ' + getSql({ POSTGRES: '"createdAt"', MYSQL: '`createdAt`', SQLSERVER: '[createdAt]'}) + ' DESC';
    const articles = await query(sql);
    res.json(articles);
}));

router.get('/banners', asyncHandler(async (req, res) => {
    const banners = await query('SELECT * FROM banners');
    res.json(banners);
}));

router.get('/settings', asyncHandler(async (req, res) => {
    const settingsRows = await query('SELECT * FROM settings');
    const settings = settingsRows.reduce((acc, row) => {
        const key = row.keyName || row.keyname;
        acc[key] = row.value;
        return acc;
    }, {});
    res.json(settings);
}));

// --- PROTECTED ROUTES ---

// CHAT
router.get('/chatMessages', protect, asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM chat_messages ORDER BY ' + getSql({ MYSQL: '`timestamp`', POSTGRES: '"timestamp"', SQLSERVER: '[timestamp]' }) + ' ASC';
    const messages = await query(sql);
    res.json(messages);
}));

router.post('/chatMessages', protect, asyncHandler(async (req, res) => {
    const { message } = req.body;
    const { id: userId, email: userEmail } = req.user;
    const msgId = uuidv4();
    const timestamp = new Date();

    const sql = getSql({
        MYSQL: 'INSERT INTO `chat_messages` (`id`, `userId`, `userEmail`, `message`, `timestamp`) VALUES (?, ?, ?, ?, ?)',
        POSTGRES: 'INSERT INTO "chat_messages" ("id", "userId", "userEmail", "message", "timestamp") VALUES ($1, $2, $3, $4, $5)',
        SQLSERVER: 'INSERT INTO [chat_messages] ([id], [userId], [userEmail], [message], [timestamp]) VALUES (@param1, @param2, @param3, @param4, @param5)',
    });
    await query(sql, [msgId, userId, userEmail, message, timestamp]);
    res.status(201).json({ id: msgId, userId, userEmail, message, timestamp: timestamp.toISOString() });
}));

// EVENTS (Admin)
router.post('/events', protect, admin, asyncHandler(async (req, res) => {
    const { title, description, date, location, image, totalTickets, ticketPrice } = req.body;
    const eventId = uuidv4();
    const sql = getSql({
        MYSQL: 'INSERT INTO `events` (`id`, `title`, `description`, `date`, `location`, `image`, `totalTickets`, `ticketPrice`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        POSTGRES: 'INSERT INTO "events" ("id", "title", "description", "date", "location", "image", "totalTickets", "ticketPrice") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        SQLSERVER: 'INSERT INTO [events] ([id], [title], [description], [date], [location], [image], [totalTickets], [ticketPrice]) VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8)',
    });
    await query(sql, [eventId, title, description, date, location, image, totalTickets, ticketPrice]);
    res.status(201).json({ id: eventId, ...req.body });
}));

router.put('/events/:id', protect, admin, asyncHandler(async (req, res) => {
    const queryData = await buildUpdateQuery('events', req.params.id, req.body);
    if (!queryData) return res.status(400).json({ message: 'No fields to update' });
    await query(queryData.sql, queryData.params);
    res.json({ message: 'Event updated' });
}));

router.delete('/events/:id', protect, admin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sql = getSql({
        MYSQL: 'DELETE FROM `events` WHERE `id` = ?',
        POSTGRES: 'DELETE FROM "events" WHERE "id" = $1',
        SQLSERVER: 'DELETE FROM [events] WHERE [id] = @param1',
    });
    await query(sql, [id]);
    res.json({ message: 'Event deleted' });
}));

// ARTICLES (Admin)
router.post('/articles', protect, admin, asyncHandler(async (req, res) => {
    const { title, content, image } = req.body;
    const articleId = uuidv4();
    const createdAt = new Date();
    const sql = getSql({
        MYSQL: 'INSERT INTO `articles` (`id`, `title`, `content`, `image`, `createdAt`) VALUES (?, ?, ?, ?, ?)',
        POSTGRES: 'INSERT INTO "articles" ("id", "title", "content", "image", "createdAt") VALUES ($1, $2, $3, $4, $5)',
        SQLSERVER: 'INSERT INTO [articles] ([id], [title], [content], [image], [createdAt]) VALUES (@param1, @param2, @param3, @param4, @param5)',
    });
    await query(sql, [articleId, title, content, image, createdAt]);
    res.status(201).json({ id: articleId, createdAt, ...req.body });
}));

router.put('/articles/:id', protect, admin, asyncHandler(async (req, res) => {
    const queryData = await buildUpdateQuery('articles', req.params.id, req.body);
    if (!queryData) return res.status(400).json({ message: 'No fields to update' });
    await query(queryData.sql, queryData.params);
    res.json({ message: 'Article updated' });
}));

router.delete('/articles/:id', protect, admin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sql = getSql({
        MYSQL: 'DELETE FROM `articles` WHERE `id` = ?',
        POSTGRES: 'DELETE FROM "articles" WHERE "id" = $1',
        SQLSERVER: 'DELETE FROM [articles] WHERE [id] = @param1',
    });
    await query(sql, [id]);
    res.json({ message: 'Article deleted' });
}));

// BANNERS (Admin)
router.post('/banners', protect, admin, asyncHandler(async (req, res) => {
    const { clientName, imageUrl, targetUrl } = req.body;
    const bannerId = uuidv4();
    const sql = getSql({
        MYSQL: 'INSERT INTO `banners` (`id`, `clientName`, `imageUrl`, `targetUrl`) VALUES (?, ?, ?, ?)',
        POSTGRES: 'INSERT INTO "banners" ("id", "clientName", "imageUrl", "targetUrl") VALUES ($1, $2, $3, $4)',
        SQLSERVER: 'INSERT INTO [banners] ([id], [clientName], [imageUrl], [targetUrl]) VALUES (@param1, @param2, @param3, @param4)',
    });
    await query(sql, [bannerId, clientName, imageUrl, targetUrl]);
    res.status(201).json({ id: bannerId, ...req.body });
}));

router.put('/banners/:id', protect, admin, asyncHandler(async (req, res) => {
    const queryData = await buildUpdateQuery('banners', req.params.id, req.body);
    if (!queryData) return res.status(400).json({ message: 'No fields to update' });
    await query(queryData.sql, queryData.params);
    res.json({ message: 'Banner updated' });
}));

router.delete('/banners/:id', protect, admin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sql = getSql({
        MYSQL: 'DELETE FROM `banners` WHERE `id` = ?',
        POSTGRES: 'DELETE FROM "banners" WHERE "id" = $1',
        SQLSERVER: 'DELETE FROM [banners] WHERE [id] = @param1',
    });
    await query(sql, [id]);
    res.json({ message: 'Banner deleted' });
}));

// NOTIFICATIONS (Protected)
router.get('/notifications', protect, asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM app_notifications ORDER BY ' + getSql({ MYSQL: '`createdAt`', POSTGRES: '"createdAt"', SQLSERVER: '[createdAt]' }) + ' DESC';
    const notifications = await query(sql);
    res.json(notifications);
}));

router.post('/notifications/read', protect, asyncHandler(async (req, res) => {
    const sql = getSql({
        MYSQL: 'UPDATE `app_notifications` SET `is_read` = true WHERE `is_read` = false',
        POSTGRES: 'UPDATE "app_notifications" SET "is_read" = true WHERE "is_read" = false',
        SQLSERVER: 'UPDATE [app_notifications] SET [is_read] = 1 WHERE [is_read] = 0',
    });
    await query(sql);
    res.json({ message: 'Notifications marked as read' });
}));

// SETTINGS (Admin)
router.put('/settings', protect, admin, asyncHandler(async (req, res) => {
    const settings = req.body;
    for (const key in settings) {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
            const value = settings[key];
            const sql = getSql({
                MYSQL: 'INSERT INTO `settings` (`keyName`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
                POSTGRES: 'INSERT INTO "settings" ("keyName", "value") VALUES ($1, $2) ON CONFLICT ("keyName") DO UPDATE SET "value" = EXCLUDED.value',
                SQLSERVER: `
                    MERGE [settings] AS target
                    USING (SELECT @param1 AS keyName, @param2 AS value) AS source
                    ON (target.keyName = source.keyName)
                    WHEN MATCHED THEN
                        UPDATE SET value = source.value
                    WHEN NOT MATCHED THEN
                        INSERT (keyName, value) VALUES (source.keyName, source.value);
                `,
            });
            const params = getSql({ MYSQL: [key, value, value], DEFAULT: [key, value] });
            await query(sql, params);
        }
    }
    res.json({ message: 'Settings updated' });
}));

// TICKETS (Protected)
router.get('/tickets', protect, asyncHandler(async (req, res) => {
    // Admin can see all tickets, users only their own
    if (req.user.role === 'ADMIN') {
        const sql = 'SELECT * FROM tickets ORDER BY ' + getSql({ MYSQL: '`purchaseDate`', POSTGRES: '"purchaseDate"', SQLSERVER: '[purchaseDate]' }) + ' DESC';
        const tickets = await query(sql);
        return res.json(tickets);
    } else {
        const sql = getSql({
            MYSQL: 'SELECT * FROM `tickets` WHERE `userId` = ? ORDER BY `purchaseDate` DESC',
            POSTGRES: 'SELECT * FROM "tickets" WHERE "userId" = $1 ORDER BY "purchaseDate" DESC',
            SQLSERVER: 'SELECT * FROM [tickets] WHERE [userId] = @param1 ORDER BY [purchaseDate] DESC',
        });
        const tickets = await query(sql, [req.user.id]);
        return res.json(tickets);
    }
}));

router.post('/tickets/purchase', protect, asyncHandler(async (req, res) => {
    const { eventId, quantity } = req.body;
    const { id: userId, email: userEmail } = req.user;

    // TODO: Add transaction support for production
    const eventSql = getSql({
        MYSQL: 'SELECT * FROM `events` WHERE `id` = ?',
        POSTGRES: 'SELECT * FROM "events" WHERE "id" = $1',
        SQLSERVER: 'SELECT * FROM [events] WHERE [id] = @param1',
    });
    const events = await query(eventSql, [eventId]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });
    const event = events[0];

    // Check availability (simple check, not race-condition proof without transactions)
    const soldTicketsSql = getSql({
        MYSQL: 'SELECT COUNT(*) as count FROM `tickets` WHERE `eventId` = ?',
        POSTGRES: 'SELECT COUNT(*) as count FROM "tickets" WHERE "eventId" = $1',
        SQLSERVER: 'SELECT COUNT(*) as count FROM [tickets] WHERE [eventId] = @param1',
    });
    const soldResult = await query(soldTicketsSql, [eventId]);
    const ticketsSold = parseInt(soldResult[0].count, 10);
    if ((ticketsSold + quantity) > event.totalTickets) {
        return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const newTickets = [];
    for (let i = 0; i < quantity; i++) {
        const ticketId = uuidv4();
        const purchaseDate = new Date();
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ticket-${ticketId}`;
        const insertSql = getSql({
            MYSQL: 'INSERT INTO `tickets` (`id`, `eventId`, `userId`, `purchaseDate`, `price`, `qrCodeUrl`, `userEmail`, `eventName`, `eventDate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            POSTGRES: 'INSERT INTO "tickets" ("id", "eventId", "userId", "purchaseDate", "price", "qrCodeUrl", "userEmail", "eventName", "eventDate") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            SQLSERVER: 'INSERT INTO [tickets] ([id], [eventId], [userId], [purchaseDate], [price], [qrCodeUrl], [userEmail], [eventName], [eventDate]) VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)',
        });
        await query(insertSql, [ticketId, eventId, userId, purchaseDate, event.ticketPrice, qrCodeUrl, userEmail, event.title, event.date]);
        newTickets.push({ id: ticketId, eventId, userId, purchaseDate, price: event.ticketPrice, qrCodeUrl, userEmail, eventName: event.title, eventDate: event.date });
    }

    res.status(201).json(newTickets);
}));

// --- DATABASE SETUP ---
router.post('/setup-database', protect, admin, asyncHandler(async (req, res) => {
    const dbConfig = req.body;
    let connection;
    try {
        connection = await createDynamicConnection(dbConfig);
        
        const schemas = getSchemas();
        const dbType = dbConfig.dbType?.toUpperCase();
        const createStatements = schemas[dbType];

        if (!createStatements) {
            throw new Error(`Nessuno schema di database trovato per il tipo: ${dbType}`);
        }

        for (const statement of createStatements) {
            await connection.query(statement);
        }

        res.status(200).json({ message: 'Struttura del database creata con successo!' });

    } catch (error) {
        console.error('Database setup failed:', error);
        let userMessage = 'Creazione della struttura del database fallita.';

        if (error.code) {
            switch (error.code) {
                case 'ENOTFOUND':
                    userMessage = 'Connessione fallita: Host non trovato. Controlla l\'indirizzo del server.';
                    break;
                case 'ECONNREFUSED':
                    userMessage = 'Connessione fallita: Connessione rifiutata. Controlla la porta e che il database sia in esecuzione.';
                    break;
                case 'ER_ACCESS_DENIED_ERROR': // MySQL
                case '28P01': // PostgreSQL
                    userMessage = 'Connessione fallita: Autenticazione fallita. Controlla utente e password.';
                    break;
                case 'ER_BAD_DB_ERROR': // MySQL
                    userMessage = `Connessione fallita: Database '${dbConfig.dbName}' non trovato. Assicurati che esista.`;
                    break;
                case '3D000': // PostgreSQL (database does not exist)
                     userMessage = `Connessione fallita: Database '${dbConfig.dbName}' non trovato. Assicurati che esista.`;
                     break;
                default:
                     userMessage = `Errore del database: ${error.message} (Codice: ${error.code})`;
            }
        } else if (error.message.includes('Login failed for user')) { // SQL Server
             userMessage = 'Connessione fallita: Autenticazione fallita. Controlla utente e password.';
        } else if (error.message.includes('Cannot open database')) { // SQL Server
             userMessage = `Connessione fallita: Database '${dbConfig.dbName}' non trovato. Assicurati che esista.`;
        }

        res.status(500).json({ message: userMessage });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));


export default router;