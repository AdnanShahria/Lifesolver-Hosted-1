-- Database Schema for LifeSolver

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('budget', 'savings')),
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    period TEXT CHECK(period IN ('monthly', 'weekly', 'yearly') OR period IS NULL),
    category TEXT,
    start_date TEXT,
    is_special INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings_transactions (
    id TEXT PRIMARY KEY,
    savings_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'withdraw')),
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    is_special INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    habit_name TEXT NOT NULL,
    streak_count INTEGER DEFAULT 0,
    last_completed_date TEXT,
    category TEXT DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 1,
    cost REAL,
    purchase_date TEXT,
    store TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    warranty_expiry TEXT,
    finance_entry_id TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT,
    is_pinned INTEGER DEFAULT 0,
    color TEXT DEFAULT 'default',
    is_archived INTEGER DEFAULT 0,
    is_trashed INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS note_metadata (
                key TEXT PRIMARY KEY,
                value INTEGER DEFAULT 0
            );

CREATE TABLE IF NOT EXISTS study_subjects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_chapters_v2 (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (subject_id) REFERENCES study_subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_parts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'not-started',
    estimated_minutes INTEGER DEFAULT 30,
    scheduled_date TEXT,
    scheduled_time TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    parent_id TEXT REFERENCES study_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES study_chapters_v2(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_common_presets (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 30,
    created_at TEXT DEFAULT (datetime('now')),
    parent_id TEXT REFERENCES study_common_presets(id) ON DELETE CASCADE,
    preset_type TEXT DEFAULT 'chapter', -- 'chapter' or 'part'
    FOREIGN KEY (subject_id) REFERENCES study_subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    context_type TEXT,
    context_id TEXT,
    budget_id TEXT,
    expected_cost REAL,
    finance_type TEXT,
    start_time TEXT,
    end_time TEXT,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    recurrence_rule TEXT,
    parent_task_id TEXT,
    order_index INTEGER DEFAULT 0,
    labels TEXT,
    reminder_time TEXT,
    is_pinned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_labels (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS task_time_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    context_type TEXT,
    estimated_duration INTEGER,
    labels TEXT,
    is_system INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    preferences TEXT DEFAULT '{}',
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    theme TEXT DEFAULT 'dark',
    currency TEXT DEFAULT 'BDT',
    language TEXT DEFAULT 'en',
    notifications_enabled INTEGER DEFAULT 1,
    monthly_budget REAL DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

