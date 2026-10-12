-- ============================================================
-- ABR GREENS INFRASTRUCTURE - PRODUCTION POSTGRESQL SCHEMA
-- Tuned for High-Concurrency (1,000+ req/sec) & Scalability
-- ============================================================

-- Create database if not exists (run as postgres superuser if needed)
-- CREATE DATABASE abr_greens;
-- \c abr_greens;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_image TEXT,
    project_brochure TEXT,
    project_payment_plan TEXT,
    location_map TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    applicant_mobile VARCHAR(50),
    applicant_address TEXT,
    applicant_city VARCHAR(100),
    applicant_state VARCHAR(100),
    form_type_id INTEGER DEFAULT 1,
    project_id INTEGER DEFAULT 1,
    plot_size_id INTEGER DEFAULT 1,
    plot_facing_id INTEGER DEFAULT 1,
    payment_plan_id INTEGER DEFAULT 1,
    payment_mode_id INTEGER DEFAULT 1,
    agent_id INTEGER DEFAULT 1,
    no_of_app INTEGER DEFAULT 1,
    profile_url TEXT,
    aadhaar_url TEXT,
    pan_url TEXT,
    signature_url TEXT,
    additional_info TEXT,
    status VARCHAR(50) DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);

-- 4. RECEIPTS TABLE (Matches Flutter 'reciept' endpoint contract)
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
    project_name VARCHAR(255),
    project_subsidy_name VARCHAR(255),
    name VARCHAR(255),
    surname VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    mobile VARCHAR(50),
    payment_plan_amount VARCHAR(100),
    ref_id VARCHAR(100),
    date VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_ref_id ON receipts(ref_id);

-- 5. MOBILE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS mobile_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    amount VARCHAR(100),
    date VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mobile_payments_user_id ON mobile_payments(user_id);

-- 6. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    mobile VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);

-- 7. RESALES TABLE
CREATE TABLE IF NOT EXISTS resales (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    society VARCHAR(255),
    plot VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resales_user_id ON resales(user_id);

-- 8. SITE VISITS TABLE
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visit_date VARCHAR(100),
    relation_manager INTEGER,
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON site_visits(user_id);

-- 9. LUCKY DRAWS TABLE
CREATE TABLE IF NOT EXISTS lucky_draws (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prize VARCHAR(255) NOT NULL,
    draw_date VARCHAR(100),
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255)
);

-- 11. GALLERY ITEMS TABLE
CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'image',
    url TEXT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items(type);

-- ============================================================
-- SEED INITIAL MASTER DATA
-- ============================================================

INSERT INTO agents (name, phone, email) 
VALUES 
    ('Amit Sharma (Senior Manager)', '9876543210', 'amit@abrgreens.com'),
    ('Pooja Verma (Area Manager)', '9876543211', 'pooja@abrgreens.com'),
    ('Rahul Rajput (Site Lead)', '9876543212', 'rahul@abrgreens.com')
ON CONFLICT DO NOTHING;

INSERT INTO projects (project_name, project_image, project_brochure, project_payment_plan, location_map, description, status)
VALUES 
    ('ABR Green Meadows Phase 1', 'images/project1.jpg', 'brochures/project1_brochure.pdf', 'plans/project1_payment_plan.pdf', 'https://maps.google.com/?q=28.6139,77.2090', 'Exclusive gated township with luxurious plots, landscaped gardens, modern clubhouses, and 24/7 security.', 'Active'),
    ('ABR Royal Palm Heights', 'images/project2.jpg', 'brochures/project2_brochure.pdf', 'plans/project2_payment_plan.pdf', 'https://maps.google.com/?q=28.4595,77.0266', 'Premium villas & high-value commercial plots equipped with state-of-the-art infrastructure & wide roads.', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO lucky_draws (title, prize, draw_date, is_open)
VALUES 
    ('Festive Bumper Draw 2026', 'Electric SUV & Gold Coin', '2026-11-15', true)
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (type, url, title)
VALUES 
    ('image', 'images/gallery1.jpg', 'Township Grand Entrance'),
    ('image', 'images/gallery2.jpg', 'Clubhouse & Swimming Pool'),
    ('video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Phase 1 Construction Drone Walkthrough')
ON CONFLICT DO NOTHING;
