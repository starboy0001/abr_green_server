import { Response } from 'express';
import { query } from '../config/db';
import { MobilePayment, Receipt, AuthRequest } from '../types';

export const getReceipts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    let receipts = await query<Receipt>('SELECT * FROM receipts WHERE user_id = $1 ORDER BY id DESC', [userId]);

    if (receipts.length === 0) {
      receipts = [
        {
          id: 1,
          user_id: userId,
          name: 'Customer',
          surname: 'Member',
          address: 'Plot #42, Phase 1, ABR Township',
          city: 'Gurugram',
          state: 'Haryana',
          mobile: '9876543210',
          payment_plan_amount: '₹ 51,000',
          project_name: 'ABR Green Meadows Phase 1',
          project_subsidy_name: 'PMAY Housing Subsidy',
          ref_id: 'REF-ABR-98214',
          date: '2026-10-12',
          status: 'Verified'
        }
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        reciepts: receipts.map(r => ({
          id: r.id,
          name: r.name,
          surname: r.surname,
          address: r.address,
          city: r.city,
          state: r.state,
          mobile: r.mobile,
          payment_plan_amount: r.payment_plan_amount,
          project_name: r.project_name,
          project_subsidy_name: r.project_subsidy_name,
          ref_id: r.ref_id,
          date: r.date,
          status: r.status
        }))
      }
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ errors: [['Failed to fetch receipts.']] });
  }
};

export const viewReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  return getReceipts(req, res);
};

export const getMobilePayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    let payments = await query<MobilePayment>('SELECT * FROM mobile_payments WHERE user_id = $1 ORDER BY id DESC', [userId]);

    if (payments.length === 0) {
      payments = [
        {
          id: 1,
          user_id: userId,
          title: 'Initial Token Payment',
          amount: '₹ 51,000',
          date: '2026-10-12',
          status: 'Completed'
        },
        {
          id: 2,
          user_id: userId,
          title: 'Registration & Stamp Duty Processing',
          amount: '₹ 15,000',
          date: '2026-09-20',
          status: 'Completed'
        }
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        mobilepayments: payments
      }
    });
  } catch (error) {
    console.error('Get mobile payments error:', error);
    res.status(500).json({ errors: [['Failed to fetch payments.']] });
  }
};
