import { Response } from 'express';
import { query } from '../config/db';
import { LuckyDraw, AuthRequest } from '../types';

export const openLuckyDraw = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draws = await query<LuckyDraw>('SELECT * FROM lucky_draws WHERE is_open = $1 LIMIT 1', [true]);
    const draw = draws[0] || {
      id: 1,
      title: 'Grand Diwali Township Mega Draw',
      prize: 'Brand New EV Car & 100g Gold Bar',
      draw_date: '2026-11-15'
    };

    res.status(200).json({
      success: true,
      data: {
        luckyDraw: {
          id: draw.id,
          title: draw.title,
          prize: draw.prize,
          draw_date: draw.draw_date
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, errors: [['Failed to fetch lucky draw.']] });
  }
};

export const getLuckyDrawResults = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      results: [
        {
          draw_name: 'Monsoon Plot Booking Draw 2026',
          winner_name: 'Rajesh Malhotra',
          winner_plot: 'Meadows #104',
          prize: 'Royal Enfield Hunter 350',
          date: '2026-08-15'
        },
        {
          draw_name: 'Early Bird Booking Draw 2026',
          winner_name: 'Sunita Mehra',
          winner_plot: 'Palm Heights #22',
          prize: '50g Gold Coin',
          date: '2026-06-01'
        }
      ]
    }
  });
};

export const isCustomerWon = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      won: false,
      message: 'You have entered the upcoming Mega Draw. Results will be announced on live stream!'
    }
  });
};
