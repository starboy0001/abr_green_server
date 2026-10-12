import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  mobile: string;
  password?: string;
  address?: string;
  city?: string;
  state?: string;
  fcm_token?: string;
  created_at?: Date;
}

export interface AuthUserPayload {
  id: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export interface Project {
  id: number;
  project_name: string;
  project_image: string;
  project_brochure: string;
  project_payment_plan: string;
  location_map: string;
  description: string;
  short_description?: string;
  status: string;
  created_at?: Date;
}

export interface Application {
  id: number;
  user_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_mobile: string;
  applicant_address?: string;
  applicant_city?: string;
  applicant_state?: string;
  form_type_id: number;
  project_id: number;
  plot_size_id: number;
  plot_facing_id: number;
  payment_plan_id: number;
  payment_mode_id: number;
  agent_id: number;
  no_of_app: number;
  profile_url?: string;
  aadhaar_url?: string;
  pan_url?: string;
  signature_url?: string;
  additional_info?: string;
  status: string;
  created_at?: Date;
}

export interface Receipt {
  id: number;
  user_id: number;
  application_id?: number;
  project_name: string;
  project_subsidy_name?: string;
  name: string;
  surname?: string;
  address?: string;
  city?: string;
  state?: string;
  mobile?: string;
  payment_plan_amount: string;
  ref_id: string;
  date: string;
  status: string;
  created_at?: Date;
}

export interface MobilePayment {
  id: number;
  user_id: number;
  title: string;
  amount: string;
  date: string;
  status: string;
  created_at?: Date;
}

export interface Referral {
  id: number;
  user_id: number;
  name: string;
  mobile: string;
  status: string;
  created_at?: Date;
}

export interface Resale {
  id: number;
  user_id: number;
  project_id: number;
  society: string;
  plot: string;
  status: string;
  created_at?: Date;
}

export interface SiteVisit {
  id: number;
  user_id: number;
  visit_date: string;
  relation_manager: number;
  status: string;
  created_at?: Date;
}

export interface LuckyDraw {
  id: number;
  title: string;
  prize: string;
  draw_date: string;
  is_open: boolean;
  created_at?: Date;
}

export interface Agent {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  created_at?: Date;
}
