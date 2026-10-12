import { Response } from 'express';
import { query } from '../config/db';
import { Referral, AuthRequest } from '../types';

export const getReferrals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const referrals = await query<Referral>('SELECT * FROM referrals WHERE user_id = $1 ORDER BY id DESC', [userId]);

    res.status(200).json({
      success: true,
      data: {
        referrals: referrals.map(r => ({
          id: r.id,
          name: r.name,
          mobile: r.mobile,
          status: r.status,
          created_at: r.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ success: false, errors: [['Failed to fetch referrals.']] });
  }
};

export const createReferral = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      res.status(400).json({ success: false, message: 'Name and mobile are required.' });
      return;
    }

    await query('INSERT INTO referrals (user_id, name, mobile, status) VALUES ($1, $2, $3, $4)', [userId, name, mobile, 'Active']);

    res.status(200).json({
      success: true,
      message: 'Referal Added Successfully'
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ success: false, message: 'Cannot add referral.' });
  }
};

export const verifyResale = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: [
      {
        resale_status: '1'
      }
    ]
  });
};

export const createResale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const { project_id, society, plot } = req.body;

    await query(
      'INSERT INTO resales (user_id, project_id, society, plot, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, parseInt(project_id || '1', 10), society || '', plot || '', 'Under Review']
    );

    res.status(200).json({
      success: true,
      data: ['Resale request submitted successfully. Our team will verify your plot documents.']
    });
  } catch (error) {
    console.error('Create resale error:', error);
    res.status(500).json({ success: false, errors: [['Failed to submit resale request.']] });
  }
};

export const createSiteVisit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const { visit_date, relation_manager } = req.body;

    await query(
      'INSERT INTO site_visits (user_id, visit_date, relation_manager, status) VALUES ($1, $2, $3, $4)',
      [userId, visit_date || '', parseInt(relation_manager || '1', 10), 'Confirmed']
    );

    res.status(200).json({
      success: true,
      data: ['Site visit booked successfully! Your Relationship Manager will welcome you on arrival.']
    });
  } catch (error) {
    console.error('Create site visit error:', error);
    res.status(500).json({ success: false, errors: [['Failed to book site visit.']] });
  }
};
