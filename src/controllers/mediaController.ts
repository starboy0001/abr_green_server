import { Response } from 'express';
import { query } from '../config/db';
import { GalleryItem, AuthRequest } from '../types';

export const getImageGallery = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await query<GalleryItem>("SELECT * FROM gallery_items WHERE type = 'image' ORDER BY id ASC");
    res.status(200).json({
      success: true,
      items: {
        data: items.map(item => ({
          image: item.url,
          title: item.title
        }))
      },
      pagination: {
        last_page: 1,
        current_page: 1,
        total: items.length
      }
    });
  } catch (error) {
    res.status(500).json({ errors: [['Failed to fetch gallery images.']] });
  }
};

export const getVideoGallery = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await query<GalleryItem>("SELECT * FROM gallery_items WHERE type = 'video' ORDER BY id ASC");
    const videoList = items.length > 0 ? items : [
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'ABR Green Meadows Phase 1 Site Drone Tour'
      },
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Clubhouse Construction Progress & Amenities'
      }
    ];

    res.status(200).json({
      success: true,
      items: {
        data: videoList.map(v => ({
          video: v.url,
          video_title: v.title
        }))
      },
      pagination: {
        last_page: 1,
        current_page: 1,
        total: videoList.length
      }
    });
  } catch (error) {
    res.status(500).json({ errors: [['Failed to fetch gallery videos.']] });
  }
};
