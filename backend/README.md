# TA25 App Backend

This backend provides a RESTful API for the TA25 Community Platform application and also serves the compiled frontend, creating a single, unified application. It is built with Node.js and Express, and can connect to MySQL, PostgreSQL, or SQL Server.

## Setup Instructions

This is a unified server that runs both the frontend and backend.

### 1. Build the Frontend
Navigate to the project's **root directory** (the one containing this `backend` folder) in your terminal and run:
```bash
# Install frontend dependencies
npm install

# Build the frontend for production
npm run build
```
This will create a `dist` folder in the root directory containing the compiled application.

### 2. Install Backend Dependencies
Now, navigate into this `backend` directory:
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory by copying the example file:
```bash
cp .env.example .env
```
Open the newly created `.env` file and fill in your database credentials and a secure `JWT_SECRET`.

### 4. Set Up the Database
a.  Choose your desired database (MySQL, PostgreSQL, or SQL Server) and ensure it is running.

b.  Create a new, **empty** database with the name you specified in your `.env` file (e.g., `ta25_app`).

The server will automatically create all necessary tables and add initial sample data the first time it starts.

### 5. Start the Server
From the `backend` directory, run:
```bash
npm start
```
The server will start on the port specified in your `.env` file (defaults to 5000).

### 6. Access the App
Open your browser and navigate to **`http://localhost:5000`**. You should see your running application.

## API
The API is defined in `backend/routes/api.js` and is available under the `/api` path prefix (e.g., `http://localhost:5000/api/events`).
