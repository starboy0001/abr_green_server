import { Response } from 'express';
import { query } from '../config/db';
import { Agent, GalleryItem, Project, AuthRequest } from '../types';

export const getProjects = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await query<Project>('SELECT * FROM projects WHERE status = $1 ORDER BY id ASC', ['Active']);
    res.status(200).json({
      success: true,
      data: {
        projects: projects.map(p => ({
          id: p.id,
          project_name: p.project_name,
          project_image: p.project_image,
          project_brochure: p.project_brochure,
          project_payment_plan: p.project_payment_plan,
          location_map: p.location_map,
          description: p.description,
          status: p.status
        }))
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ errors: [['Failed to fetch projects.']] });
  }
};

export const getHomeImages = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const images = await query<GalleryItem>("SELECT * FROM gallery_items WHERE type = 'image' LIMIT 5");
    res.status(200).json({
      success: true,
      data: {
        images: images.map(img => img.url)
      }
    });
  } catch (error) {
    res.status(200).json({ success: true, data: { images: [] } });
  }
};

export const getAbout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      app_settings: {
        about_us: 'ABR Greens Infrastructure is committed to transforming landscapes into vibrant, sustainable, and modern townships. With over a decade of excellence in real estate development, our projects integrate lush greenery, prime connectivity, premium amenities, and world-class architecture.'
      }
    }
  });
};

export const getContactDetails = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      app_settings: {
        contact_address: 'ABR Tower, Sector 62, Golf Course Ext Road, Gurugram, Haryana - 122002',
        contact_email: 'support@abrgreens.com',
        contact_phone: '+91 98765 43210'
      }
    }
  });
};

export const getPreferences = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await query<Agent>('SELECT id, name FROM agents ORDER BY id ASC');

    const preferences = {
      plotSize: [
        { id: 1, name: '100 Sq. Yards' },
        { id: 2, name: '150 Sq. Yards' },
        { id: 3, name: '200 Sq. Yards' },
        { id: 4, name: '300 Sq. Yards' },
        { id: 5, name: '500 Sq. Yards' }
      ],
      plotFacing: [
        { id: 1, name: 'North Facing' },
        { id: 2, name: 'East Facing' },
        { id: 3, name: 'North-East (Corner)' },
        { id: 4, name: 'Park Facing' },
        { id: 5, name: 'Wide Road Facing' }
      ],
      paymentMode: [
        { id: 1, name: 'Online / NetBanking / UPI' },
        { id: 2, name: 'Cheque / Demand Draft' },
        { id: 3, name: 'Bank Transfer (RTGS / NEFT)' }
      ],
      paymentPlan: [
        { id: 1, name: 'Construction Linked Plan (CLP)' },
        { id: 2, name: 'Down Payment Plan (10% Discount)' },
        { id: 3, name: 'Flexi Payment Plan (50:50)' }
      ],
      agent: agents.map(a => ({ id: a.id, name: a.name })),
      formType: [
        { id: 1, name: 'Residential Plot Booking' },
        { id: 2, name: 'Commercial Plot Booking' },
        { id: 3, name: 'Villa Expression of Interest' }
      ]
    };

    res.status(200).json({
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ errors: [['Failed to fetch preferences.']] });
  }
};

export const getAgents = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await query<Agent>('SELECT id, name FROM agents ORDER BY id ASC');
    res.status(200).json({
      success: true,
      data: {
        agents: agents.map(a => ({ id: a.id, name: a.name }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, errors: [['Failed to retrieve agents.']] });
  }
};
