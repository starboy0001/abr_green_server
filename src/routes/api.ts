import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

import * as authController from '../controllers/authController';
import * as projectController from '../controllers/projectController';
import * as applicationController from '../controllers/applicationController';
import * as receiptController from '../controllers/receiptController';
import * as referralController from '../controllers/referralController';
import * as luckyDrawController from '../controllers/luckyDrawController';
import * as mediaController from '../controllers/mediaController';

const router = Router();

// ==================== AUTH & PROFILE ====================
router.post('/customer/register', authController.register);
router.post('/customer/login', authController.login);
router.all('/customer/verify', authMiddleware, authController.verify);
router.all('/customer/forgot-password', authController.forgotPassword);
router.all('/customer/profile', authMiddleware, authController.getProfile);
router.post('/customer/profile/update', authMiddleware, authController.updateProfile);
router.post('/customer/profile/update-password', authMiddleware, authController.updatePassword);
router.all('/customer/notification/start', authMiddleware, authController.pushFCMToken);

// ==================== PROJECTS & CATALOG ====================
router.all('/customer/project', projectController.getProjects);
router.all('/customer/projects', projectController.getProjects);
router.all('/customer/get-home-image', projectController.getHomeImages);
router.all('/customer/about', projectController.getAbout);
router.all('/customer/contact-detail', projectController.getContactDetails);
router.all('/customer/application/get-preference', projectController.getPreferences);
router.all('/customer/agent', projectController.getAgents);

// ==================== APPLICATIONS & FILES ====================
router.post('/customer/application/upload-file', upload.single('image'), applicationController.uploadFile);
router.post('/customer/application/signature', upload.single('signature'), applicationController.uploadSignature);
router.post('/customer/application/create', authMiddleware, applicationController.createApplication);
router.all('/customer/application/get-customer-application', authMiddleware, applicationController.getCustomerApplications);
router.all('/customer/application/view', authMiddleware, applicationController.viewApplication);
router.all('/customer/allotment-letter/download', applicationController.downloadAllotmentLetter);

// ==================== RECEIPTS & PAYMENTS ====================
// Notice spelling 'reciept' matching Flutter app_urls.dart
router.all('/customer/reciept', authMiddleware, receiptController.getReceipts);
router.all('/customer/reciept/view', authMiddleware, receiptController.viewReceipt);
router.all('/customer/mobile-payments', authMiddleware, receiptController.getMobilePayments);

// ==================== REFERRALS, RESALE & SITE VISITS ====================
router.all('/customer/referral', authMiddleware, referralController.getReferrals);
router.post('/customer/referral/create', authMiddleware, referralController.createReferral);
router.all('/customer/resale/verify', authMiddleware, referralController.verifyResale);
router.post('/customer/resale/create', authMiddleware, referralController.createResale);
router.post('/customer/site-visit/create', authMiddleware, referralController.createSiteVisit);

// ==================== LUCKY DRAW ====================
router.all('/customer/open-lucky-draw', authMiddleware, luckyDrawController.openLuckyDraw);
router.all('/customer/lucky-draw', authMiddleware, luckyDrawController.getLuckyDrawResults);
router.all('/customer/is-customer-won', authMiddleware, luckyDrawController.isCustomerWon);

// ==================== MEDIA / GALLERY ====================
router.all('/customer/mobile-image-gallery', mediaController.getImageGallery);
router.all('/customer/mobile-video-gallery', mediaController.getVideoGallery);

export default router;
