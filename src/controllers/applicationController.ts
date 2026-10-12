import { Response } from 'express';
import { query } from '../config/db';
import { Application, Agent, AuthRequest } from '../types';

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ errors: [['No file was uploaded.']] });
    return;
  }
  const relativeUrl = `uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    data: {
      url: relativeUrl
    }
  });
};

export const uploadSignature = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ errors: [['No signature file provided.']] });
    return;
  }
  const relativeUrl = `uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    data: {
      url: relativeUrl
    }
  });
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const body = req.body;

    const result = await query<{ id: number }>(
      `INSERT INTO applications (
        user_id, applicant_name, applicant_email, applicant_mobile, applicant_address,
        applicant_city, applicant_state, form_type_id, project_id, plot_size_id,
        plot_facing_id, payment_plan_id, payment_mode_id, agent_id, no_of_app,
        profile_url, aadhaar_url, pan_url, signature_url, additional_info, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id`,
      [
        userId,
        body.name || '',
        body.email || '',
        body.mobile || '',
        body.address || '',
        body.city || '',
        body.state || '',
        parseInt(body.form_type || '1', 10),
        parseInt(body.project_id || '1', 10),
        parseInt(body.selected_plot_size || '1', 10),
        parseInt(body.selected_plot_facing || '1', 10),
        parseInt(body.selected_payment_plan || '1', 10),
        parseInt(body.selected_payment_mode || '1', 10),
        parseInt(body.selected_agent || '1', 10),
        parseInt(body.no_of_app || '1', 10),
        body.profile_url || '',
        body.aadhaar_url || '',
        body.pan_url || '',
        body.signature_url || '',
        body.additional_info || '',
        'Submitted'
      ]
    );

    const appId = result[0].id;
    await query(
      `INSERT INTO receipts (
        user_id, application_id, project_name, project_subsidy_name, name, surname,
        address, city, state, mobile, payment_plan_amount, ref_id, date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        userId,
        appId,
        'ABR Green Meadows Phase 1',
        'PMAY Subsidy Scheme',
        body.name || 'Applicant',
        body.surname || '',
        body.address || 'Township Site',
        body.city || 'Gurugram',
        body.state || 'Haryana',
        body.mobile || '',
        '₹ 51,000 (Booking Token)',
        `ABR-${Date.now().toString().slice(-6)}`,
        new Date().toISOString().slice(0, 10),
        'Verified'
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Application Created Successfully',
      data: {
        id: appId
      }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ success: false, errors: [['Failed to create application.']] });
  }
};

export const getCustomerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 1;
    const applications = await query<Application & { project_name: string }>(
      `SELECT a.*, p.project_name 
       FROM applications a 
       LEFT JOIN projects p ON a.project_id = p.id 
       WHERE a.user_id = $1 ORDER BY a.id DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        applications: applications.map(app => ({
          id: app.id,
          name: app.applicant_name,
          email: app.applicant_email,
          mobile: app.applicant_mobile,
          project_name: app.project_name || 'ABR Green Meadows',
          status: app.status || 'Verified',
          created_at: app.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ errors: [['Failed to fetch applications.']] });
  }
};

export const viewApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.body;
    const applications = await query<Application>('SELECT * FROM applications WHERE id = $1', [id || 1]);
    const agents = await query<Agent>('SELECT id, name FROM agents');

    res.status(200).json({
      success: true,
      data: {
        application: applications[0] || {},
        agent: agents,
        formType: [{ id: 1, name: 'Residential' }],
        plotSize: [{ id: 1, name: '150 Sq. Yards' }],
        plotFacing: [{ id: 1, name: 'North Facing' }],
        paymentMode: [{ id: 1, name: 'Online / Cheque' }],
        paymentPlan: [{ id: 1, name: 'Construction Linked' }]
      }
    });
  } catch (error) {
    res.status(500).json({ errors: [['Failed to view application.']] });
  }
};

export const downloadAllotmentLetter = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="allotment_letter.pdf"');
  
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
  );
  res.send(minimalPdf);
};
