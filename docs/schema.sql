-- LinkedIn Autopilot AI PostgreSQL Database Schema
-- Design: Multi-tenant SaaS architecture supporting autonomous LinkedIn publishing, AI content queues, and WhatsApp command-first workflows.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'agency', 'enterprise')),
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    max_posts_limit INT DEFAULT 30,
    max_linkedin_accounts INT DEFAULT 1,
    ai_credits_limit INT DEFAULT 100,
    ai_credits_used INT DEFAULT 0,
    
    -- Autopilot Settings
    autopilot_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (autopilot_status IN ('active', 'paused')),
    posting_frequency VARCHAR(50) NOT NULL DEFAULT 'daily' CHECK (posting_frequency IN ('daily', 'twice_daily', 'weekly')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'end_user' CHECK (role IN ('super_admin', 'content_manager', 'end_user')),
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(128),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organization Memberships (Many-to-Many mapping)
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id, user_id)
);

-- 4. User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    timezone VARCHAR(100) DEFAULT 'UTC',
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": true, "push": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LinkedIn Integrations
CREATE TABLE linkedin_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL DEFAULT 'profile' CHECK (account_type IN ('profile', 'company')),
    linkedin_urn VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'urn:li:person:abcde12345'
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    is_expired BOOLEAN DEFAULT FALSE,
    
    -- Smart Approval Mode per account
    approval_mode VARCHAR(50) NOT NULL DEFAULT 'full_approval' CHECK (approval_mode IN ('full_approval', 'weekly_approval', 'trusted_ai')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Content Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 1, -- Lower numbers indicate higher priority
    frequency_per_week INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- 7. Weekly Strategies Matrix Table
CREATE TABLE weekly_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    content_type VARCHAR(100) NOT NULL, -- e.g., 'Industry Insight', 'Educational Post', 'Case Study'
    theme_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, day_of_week)
);

-- 8. WhatsApp Contacts Table
CREATE TABLE whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, phone_number)
);

-- 9. Broadcast Campaign Auditing
CREATE TABLE whatsapp_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Blog Posts (Generated and edited draft records)
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body_content TEXT NOT NULL,
    linkedin_post_content TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    image_url VARCHAR(512),
    summary TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    source_type VARCHAR(50) DEFAULT 'user_topic' CHECK (source_type IN ('user_topic', 'trending_news', 'rss_feed', 'url_scrape', 'google_news')),
    source_url VARCHAR(512),
    tone VARCHAR(50) DEFAULT 'professional',
    seo_keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Publishing Queue & Approval Center
CREATE TABLE publishing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    linkedin_account_id UUID REFERENCES linkedin_accounts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'publishing', 'published', 'failed')),
    whatsapp_notification_sent BOOLEAN DEFAULT FALSE,
    whatsapp_message_sid VARCHAR(255),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    rejection_feedback TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Analytics Data
CREATE TABLE publishing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID REFERENCES publishing_queue(id) ON DELETE CASCADE,
    linkedin_post_urn VARCHAR(255), -- URN of the published share on LinkedIn
    impressions INT DEFAULT 0,
    reach INT DEFAULT 0,
    engagement INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    clicks INT DEFAULT 0,
    followers_growth INT DEFAULT 0,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (queue_id, recorded_date)
);

-- 13. AI Logs and Auditing
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g. 'generate_post', 'rewrite', 'generate_image'
    model_used VARCHAR(100) NOT NULL, -- e.g. 'gemini-1.5-pro', 'gpt-4o'
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    credits_deducted INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Publishing Logs
CREATE TABLE publishing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID REFERENCES publishing_queue(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'success', 'failure'
    error_message TEXT,
    attempt_number INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_memberships_user ON organization_members(user_id);
CREATE INDEX idx_queue_status ON publishing_queue(status);
CREATE INDEX idx_queue_scheduled ON publishing_queue(scheduled_time) WHERE status = 'scheduled';
CREATE INDEX idx_posts_org ON blog_posts(organization_id);
CREATE INDEX idx_analytics_date ON publishing_analytics(recorded_date);
CREATE INDEX idx_contacts_org ON whatsapp_contacts(organization_id);
