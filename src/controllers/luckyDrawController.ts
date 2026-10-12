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
          draw_date: draw.draw_date,
          image: 'images/luckydraw.jpg',
          status: 'open',
          flash_msg: 'Grand Township Mega Draw — Live on 15 Nov 2026!',
          declare_on: 'Draw Date: 15 November 2026',
          footnote: '* Exclusive for all active ABR Greens township members. Terms & conditions apply.'
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
      status: 'other_than_declared',
      drawTimer: 3600,
      luckyDraws: [
        {
          name: 'Rajesh',
          surname: 'Malhotra',
          created_at: '2026-08-15 14:30:00',
          dob: '1985-04-12',
          ticket_no: 'ABR-LUCKY-7821',
          customer_id: '1',
          allotted_plot: 'Meadows #104'
        },
        {
          name: 'Sunita',
          surname: 'Mehra',
          created_at: '2026-06-01 10:15:00',
          dob: '1990-11-20',
          ticket_no: 'ABR-LUCKY-3419',
          customer_id: '2',
          allotted_plot: 'Palm Heights #22'
        }
      ],
      results: [
        {
          draw_name: 'Monsoon Plot Booking Draw 2026',
          winner_name: 'Rajesh Malhotra',
          winner_plot: 'Meadows #104',
          prize: 'Royal Enfield Hunter 350',
          date: '2026-08-15'
        }
      ]
    }
  });
};

export const isCustomerWon = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: ['Rajesh Malhotra (Meadows #104)']
  });
};
