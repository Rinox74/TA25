import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, with a larger limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// --- Global Error Handler ---
// This must come AFTER your API routes to catch errors from them.
app.use((err, req, res, next) => {
    console.error("An unhandled error occurred:", err.message);
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message || 'An internal server error occurred.',
    });
});


// --- Static file serving for production ---
const buildPath = path.join(__dirname, '..', 'dist');

// Serve static files from the React app
app.use(express.static(buildPath));

// The "catchall" handler: for any request that doesn't
// match an API route, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
        // If index.html is not found (e.g., frontend not built yet),
        // send a helpful message instead of a 404.
        res.status(500).send('Frontend not built. Please run `npm run build` in the root directory.');
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. Access the app at http://localhost:${PORT}`);
});