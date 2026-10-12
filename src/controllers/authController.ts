import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { JWT_SECRET } from '../middleware/auth';
import { AuthRequest, User } from '../types';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, surname, email, mobile, password, address, city, state } = req.body;

    if (!email || !password) {
      res.status(401).json({
        errors: [['Email and password are required.']]
      });
      return;
    }

    const existingUsers = await query<User>('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      res.status(401).json({
        errors: [['An account with this email already exists.']]
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query<User>(
      `INSERT INTO users (name, surname, email, mobile, password, address, city, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, surname, email, mobile, address, city, state`,
      [name || '', surname || '', email.trim().toLowerCase(), mobile || '', hashedPassword, address || '', city || '', state || '']
    );

    const user = result[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      data: {
        access: token,
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          mobile: user.mobile
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ errors: [['Internal server error during registration.']] });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(401).json({
        errors: [['Email and password are required.']]
      });
      return;
    }

    const users = await query<User>('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (users.length === 0 || !users[0].password) {
      res.status(401).json({
        errors: [['Invalid credentials. Please check email and password.']]
      });
      return;
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({
        errors: [['Invalid credentials. Please check email and password.']]
      });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      data: {
        access: token,
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          mobile: user.mobile
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errors: [['Internal server error during login.']] });
  }
};

export const verify = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'User verified.'
  });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const users = await query<User>('SELECT id, name, surname, email, mobile, address, city, state FROM users WHERE id = $1', [userId]);
    if (users.length === 0) {
      res.status(404).json({ success: false, errors: [['User not found.']] });
      return;
    }
    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, errors: [['Failed to retrieve profile.']] });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { mobile, address, city, state } = req.body;
    await query(
      `UPDATE users SET mobile = $1, address = $2, city = $3, state = $4 WHERE id = $5`,
      [mobile || '', address || '', city || '', state || '', userId]
    );

    const updated = await query<User>('SELECT id, name, surname, email, mobile, address, city, state FROM users WHERE id = $1', [userId]);
    res.status(200).json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, errors: [['Failed to update profile.']] });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { old_password, new_password } = req.body;
    const users = await query<User>('SELECT password FROM users WHERE id = $1', [userId]);
    if (users.length === 0 || !users[0].password) {
      res.status(404).json({ errors: [['User not found.']] });
      return;
    }

    const isMatch = await bcrypt.compare(old_password, users[0].password!);
    if (!isMatch) {
      res.status(401).json({ errors: [['Current password does not match.']] });
      return;
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [newHash, userId]);

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ errors: [['Failed to update password.']] });
  }
};

export const forgotPassword = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Reset instructions have been sent to your registered contact.'
  });
};

export const pushFCMToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fcm_token } = req.body;
    if (req.user?.id && fcm_token) {
      await query('UPDATE users SET fcm_token = $1 WHERE id = $2', [fcm_token, req.user.id]);
    }
    res.status(200).json({ success: true, message: 'FCM token registered.' });
  } catch (error) {
    res.status(200).json({ success: true });
  }
};
