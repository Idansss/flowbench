-- Flowbench Marketplace Schema Extension
-- Run this AFTER the main schema.sql

-- Sellers (extends users table)
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  tagline VARCHAR(200),
  description TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  
  -- Level and status
  level VARCHAR(20) DEFAULT 'new', -- new, level1, level2, top_rated, pro, certified
  rating DECIMAL(3,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  completed_orders INT DEFAULT 0,
  cancelled_orders INT DEFAULT 0,
  
  -- Performance metrics
  response_time_hours INT DEFAULT 24,
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 100,
  
  -- Premium tiers
  is_pro BOOLEAN DEFAULT FALSE,
  is_certified BOOLEAN DEFAULT FALSE,
  certification_partner VARCHAR(100),
  
  -- Verification
  verification_status VARCHAR(20) DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  
  -- Skills and languages
  skills TEXT[],
  languages JSONB, -- [{language: "English", level: "native"}]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_sellers_user ON sellers(user_id);
CREATE INDEX idx_sellers_username ON sellers(username);
CREATE INDEX idx_sellers_level ON sellers(level);
CREATE INDEX idx_sellers_rating ON sellers(rating DESC);

-- Gigs
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  
  -- Basic info
  title VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  
  -- Content
  description TEXT NOT NULL,
  search_tags TEXT[], -- Max 5 tags
  faq JSONB, -- [{question: "", answer: ""}]
  
  -- Media
  gallery_urls TEXT[], -- Up to 3 images
  video_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, active, paused, rejected
  rejection_reason TEXT,
  
  -- Promotion
  featured BOOLEAN DEFAULT FALSE,
  promoted BOOLEAN DEFAULT FALSE,
  
  -- Stats
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  orders INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_gigs_seller ON gigs(seller_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_gigs_category ON gigs(category) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_gigs_status ON gigs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_gigs_search_tags ON gigs USING GIN(search_tags);
CREATE INDEX idx_gigs_rating ON gigs(rating DESC) WHERE status = 'active';

-- Gig Packages (Basic, Standard, Premium)
CREATE TABLE gig_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
  name VARCHAR(100),
  description TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 5),
  delivery_days INT NOT NULL CHECK (delivery_days >= 1),
  revisions INT CHECK (revisions >= 0), -- null = unlimited
  
  -- Features (what's included)
  features JSONB NOT NULL, -- ["Feature 1", "Feature 2"]
  
  -- Extras
  fast_delivery_price DECIMAL(10,2),
  extra_revisions_price DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packages_gig ON gig_packages(gig_id);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  
  -- Parties
  buyer_id UUID REFERENCES users(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  gig_id UUID REFERENCES gigs(id) NOT NULL,
  package_id UUID REFERENCES gig_packages(id),
  
  -- Pricing
  package_tier VARCHAR(20),
  base_price DECIMAL(10,2) NOT NULL,
  extras_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', 
  -- pending, in_progress, delivered, revision_requested, completed, cancelled, disputed
  
  -- Requirements and delivery
  requirements JSONB NOT NULL,
  delivery_urls TEXT[],
  delivery_note TEXT,
  
  -- Timing
  due_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Revisions
  revisions_remaining INT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_seller ON orders(seller_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_due ON orders(due_date) WHERE status IN ('pending', 'in_progress');

-- Order Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  milestone_number INT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, delivered, approved, released
  
  due_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_order ON milestones(order_id, milestone_number);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  buyer_id UUID REFERENCES users(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  gig_id UUID REFERENCES gigs(id) NOT NULL,
  
  price_per_month DECIMAL(10,2) NOT NULL,
  deliverables_per_month INT NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active', -- active, paused, cancelled, expired
  
  billing_day INT CHECK (billing_day >= 1 AND billing_day <= 28),
  next_billing_date TIMESTAMPTZ,
  last_billed_at TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_buyer ON subscriptions(buyer_id);
CREATE INDEX idx_subscriptions_seller ON subscriptions(seller_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date) WHERE status = 'active';

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  conversation_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  
  message_text TEXT NOT NULL,
  attachments JSONB, -- [{name, url, size}]
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_order ON messages(order_id, created_at);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read) WHERE deleted_at IS NULL;

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) UNIQUE NOT NULL,
  
  reviewer_id UUID REFERENCES users(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  gig_id UUID REFERENCES gigs(id) NOT NULL,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Breakdown
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
  recommend BOOLEAN,
  
  -- Response
  seller_response TEXT,
  responded_at TIMESTAMPTZ,
  
  is_public BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_seller ON reviews(seller_id) WHERE is_public = TRUE;
CREATE INDEX idx_reviews_gig ON reviews(gig_id) WHERE is_public = TRUE;
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- Analytics (daily aggregates)
CREATE TABLE seller_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  
  date DATE NOT NULL,
  
  -- Traffic
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  
  -- Orders
  orders_started INT DEFAULT 0,
  orders_completed INT DEFAULT 0,
  orders_cancelled INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Performance
  response_rate DECIMAL(5,2) DEFAULT 0,
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(seller_id, date)
);

CREATE INDEX idx_analytics_seller_date ON seller_analytics(seller_id, date DESC);

-- Promoted Gigs Campaigns
CREATE TABLE promoted_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  
  campaign_name VARCHAR(100),
  daily_budget DECIMAL(8,2) NOT NULL,
  max_bid DECIMAL(6,4) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active', -- active, paused, ended, out_of_budget
  
  total_budget DECIMAL(10,2),
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Stats
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  orders INT DEFAULT 0,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Offers
CREATE TABLE custom_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  buyer_id UUID REFERENCES users(id) NOT NULL,
  
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_days INT NOT NULL,
  revisions INT,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired, converted
  
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Briefs (from buyers)
CREATE TABLE project_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) NOT NULL,
  
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  description TEXT NOT NULL,
  
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  timeline_days INT,
  
  required_skills TEXT[],
  attachments JSONB,
  
  status VARCHAR(20) DEFAULT 'open', -- open, matched, closed
  matched_seller_id UUID REFERENCES sellers(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations (pre-order calls)
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  buyer_id UUID REFERENCES users(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  gig_id UUID REFERENCES gigs(id),
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 15,
  
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  
  notes TEXT,
  call_url TEXT, -- Zoom/Meet link
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Plus Memberships
CREATE TABLE seller_plus_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) UNIQUE NOT NULL,
  
  tier VARCHAR(20) NOT NULL, -- kickstart, standard, premium
  monthly_fee DECIMAL(8,2) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  
  features JSONB, -- Tier-specific features
  success_manager_id UUID,
  
  next_billing_date TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE sellers IS 'Seller profiles extending user accounts';
COMMENT ON TABLE gigs IS 'Service listings with packages and media';
COMMENT ON TABLE orders IS 'Transactions between buyers and sellers';
COMMENT ON TABLE milestones IS 'Staged payments for complex projects';
COMMENT ON TABLE subscriptions IS 'Recurring monthly service agreements';
COMMENT ON TABLE messages IS 'Order-based communication';
COMMENT ON TABLE reviews IS 'Ratings and feedback per order';

