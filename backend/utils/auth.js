import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, getSql } from '../config/db.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const sql = getSql({
        MYSQL: 'SELECT id, email, role, firstName, lastName, company FROM users WHERE id = ?',
        POSTGRES: 'SELECT id, email, role, "firstName", "lastName", company FROM users WHERE id = $1',
        SQLSERVER: 'SELECT id, email, role, firstName, lastName, company FROM users WHERE id = @param1',
      });
      
      const users = await query(sql, [decoded.id]);
      if (users.length > 0) {
        req.user = users[0];
        next();
      } else {
        res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict to admins
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
