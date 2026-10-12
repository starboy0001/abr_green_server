import { Pool, PoolConfig } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;
let sqliteDb: any = null;

function initSqlite(): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  PostgreSQL connection failed in production mode.');
    return;
  }
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    console.log(`✓ High-performance local database active: ${dbPath}`);
  } catch (err: any) {
    console.error('Failed to initialize local database:', err.message);
  }
}

export async function initDb(): Promise<void> {
  const poolConfig: PoolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: parseInt(process.env.DB_POOL_MAX || '30', 10), // Tuned for 1,000 req/sec on EC2
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgrespassword',
        database: process.env.DB_NAME || 'postgres',
        max: parseInt(process.env.DB_POOL_MAX || '30', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };

  console.log(`📡 Connecting to PostgreSQL at ${process.env.DATABASE_URL ? 'DATABASE_URL' : `${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`}...`);

  const testPool = new Pool(poolConfig);
  try {
    const client = await testPool.connect();
    client.release();
    pool = testPool;
    console.log('✓ Successfully connected to PostgreSQL database pool!');
  } catch (err: any) {
    console.warn(`⚠️  Could not connect to PostgreSQL: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚡ Falling back to local development database for instant local testing.');
      initSqlite();
    } else {
      console.error('❌ Failed to connect to PostgreSQL in production mode. Check your database credentials.');
    }
  }
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  if (pool) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res.rows as T[];
    } finally {
      client.release();
    }
  } else if (sqliteDb) {
    let sqliteSql = text.replace(/\$(\d+)/g, '?');
    const sqliteParams = params.map(p => (typeof p === 'boolean' ? (p ? 1 : 0) : p));
    const trimmed = sqliteSql.trim();
    if (trimmed.toUpperCase().startsWith('SELECT')) {
      return sqliteDb.prepare(sqliteSql).all(...sqliteParams) as T[];
    } else {
      const info = sqliteDb.prepare(sqliteSql).run(...sqliteParams);
      return [{ id: info.lastInsertRowid, ...info }] as unknown as T[];
    }
  } else {
    throw new Error('Database is not initialized.');
  }
}

export async function initSchema(): Promise<void> {
  await initDb();
  console.log('⏳ Synchronizing database tables and indexes...');

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);`,

    `CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255) NOT NULL,
      project_image TEXT,
      project_brochure TEXT,
      project_payment_plan TEXT,
      location_map TEXT,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);`,

    `CREATE TABLE IF NOT EXISTS receipts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      application_id INTEGER,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);`,

    `CREATE TABLE IF NOT EXISTS mobile_payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255),
      amount VARCHAR(100),
      date VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_mobile_payments_user_id ON mobile_payments(user_id);`,

    `CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255),
      mobile VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);`,

    `CREATE TABLE IF NOT EXISTS resales (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      project_id INTEGER,
      society VARCHAR(255),
      plot VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS site_visits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      visit_date VARCHAR(100),
      relation_manager INTEGER,
      status VARCHAR(50) DEFAULT 'Confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS lucky_draws (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      prize VARCHAR(255) NOT NULL,
      draw_date VARCHAR(100),
      is_open BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255)
    );`,

    `CREATE TABLE IF NOT EXISTS gallery_items (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) DEFAULT 'image',
      url TEXT NOT NULL,
      title VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const sql of tables) {
    let executableSql = sql;
    if (!pool && sqliteDb) {
      executableSql = executableSql
        .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/BOOLEAN/g, 'INTEGER');
    }
    await query(executableSql);
  }

  await seedData();
  console.log('✓ Database tables and indexes ready.');
}

async function seedData(): Promise<void> {
  const existing = await query<{ count: string }>('SELECT count(*) as count FROM projects');
  if (parseInt(existing[0]?.count || '0', 10) > 0) {
    return;
  }

  console.log('🌱 Inserting default projects and agents...');

  await query('INSERT INTO agents (id, name, phone, email) VALUES ($1, $2, $3, $4)', [1, 'Amit Sharma (Senior Manager)', '9876543210', 'amit@abrgreens.com']);
  await query('INSERT INTO agents (id, name, phone, email) VALUES ($1, $2, $3, $4)', [2, 'Pooja Verma (Area Manager)', '9876543211', 'pooja@abrgreens.com']);
  await query('INSERT INTO agents (id, name, phone, email) VALUES ($1, $2, $3, $4)', [3, 'Rahul Rajput (Site Lead)', '9876543212', 'rahul@abrgreens.com']);

  await query(
    `INSERT INTO projects (id, project_name, project_image, project_brochure, project_payment_plan, location_map, description, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      1,
      'ABR Green Meadows Phase 1',
      'images/project1.jpg',
      'brochures/project1_brochure.pdf',
      'plans/project1_payment_plan.pdf',
      'https://maps.google.com/?q=28.6139,77.2090',
      'Exclusive gated township with luxurious plots, landscaped gardens, modern clubhouses, and 24/7 security.',
      'Active'
    ]
  );

  await query(
    `INSERT INTO projects (id, project_name, project_image, project_brochure, project_payment_plan, location_map, description, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      2,
      'ABR Royal Palm Heights',
      'images/project2.jpg',
      'brochures/project2_brochure.pdf',
      'plans/project2_payment_plan.pdf',
      'https://maps.google.com/?q=28.4595,77.0266',
      'Premium villas & high-value commercial plots equipped with state-of-the-art infrastructure & wide roads.',
      'Active'
    ]
  );

  await query(
    `INSERT INTO lucky_draws (id, title, prize, draw_date, is_open) 
     VALUES ($1, $2, $3, $4, $5)`,
    [1, 'Festive Bumper Draw 2026', 'Electric SUV & Gold Coin', '2026-11-15', true]
  );

  await query(`INSERT INTO gallery_items (type, url, title) VALUES ($1, $2, $3)`, ['image', 'images/gallery1.jpg', 'Township Grand Entrance']);
  await query(`INSERT INTO gallery_items (type, url, title) VALUES ($1, $2, $3)`, ['image', 'images/gallery2.jpg', 'Clubhouse & Swimming Pool']);
  await query(`INSERT INTO gallery_items (type, url, title) VALUES ($1, $2, $3)`, ['video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Phase 1 Construction Drone Walkthrough']);

  if (pool) {
    try {
      await query(`SELECT setval(pg_get_serial_sequence('agents', 'id'), COALESCE(max(id), 1)) FROM agents;`);
      await query(`SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE(max(id), 1)) FROM projects;`);
      await query(`SELECT setval(pg_get_serial_sequence('lucky_draws', 'id'), COALESCE(max(id), 1)) FROM lucky_draws;`);
      await query(`SELECT setval(pg_get_serial_sequence('gallery_items', 'id'), COALESCE(max(id), 1)) FROM gallery_items;`);
    } catch (e) {
      // Ignored if sequences already in sync
    }
  }
}

export { pool };
