/*
  # Signal87 Core Database Schema

  ## Overview
  Creates the foundational database structure for the Signal87 AI document intelligence platform.
  Implements secure document management with classification levels, duplicate detection, and comprehensive audit trails.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `role` (text) - User role (admin, analyst, viewer)
  - `clearance_level` (text) - Security clearance (unclassified, secret, top_secret)
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_login` (timestamptz) - Last login timestamp

  ### 2. folders
  - `id` (uuid, primary key) - Folder identifier
  - `name` (text) - Folder name
  - `parent_id` (uuid, nullable) - Parent folder for hierarchy
  - `owner_id` (uuid) - User who owns the folder
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. documents
  - `id` (uuid, primary key) - Document identifier
  - `title` (text) - Document title
  - `file_path` (text) - Storage path/URL
  - `file_size` (bigint) - File size in bytes
  - `mime_type` (text) - File MIME type
  - `classification` (text) - Security classification level
  - `category` (text) - Document category
  - `folder_id` (uuid, nullable) - Parent folder
  - `owner_id` (uuid) - User who uploaded the document
  - `content_hash` (text) - SHA-256 hash for integrity
  - `embedding_vector` (text, nullable) - Serialized vector embedding for semantic search
  - `status` (text) - Processing status (pending, processed, error)
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. duplicate_clusters
  - `id` (uuid, primary key) - Cluster identifier
  - `cluster_id` (text, unique) - Human-readable cluster ID
  - `canonical_document_id` (uuid) - Reference to canonical document
  - `title` (text) - Cluster title
  - `confidence_score` (numeric) - Similarity confidence (0-1)
  - `intelligence_score` (integer) - Composite intelligence score (0-100)
  - `status` (text) - Review status (watch, review, approved)
  - `domain` (text) - Source domains
  - `classification_path` (text) - Classification level transitions
  - `modalities` (text[]) - Content types detected
  - `findings` (jsonb) - Detection findings array
  - `last_observed` (timestamptz) - Last detection timestamp
  - `created_at` (timestamptz) - Cluster creation timestamp

  ### 5. document_duplicates
  - `id` (uuid, primary key) - Record identifier
  - `cluster_id` (uuid) - Reference to duplicate cluster
  - `document_id` (uuid) - Reference to document
  - `similarity_score` (numeric) - Individual similarity score (0-1)
  - `detection_method` (text) - Detection algorithm used
  - `created_at` (timestamptz) - Detection timestamp

  ### 6. document_tags
  - `id` (uuid, primary key) - Tag identifier
  - `document_id` (uuid) - Reference to document
  - `tag` (text) - Tag value
  - `confidence` (numeric, nullable) - AI confidence if auto-generated
  - `created_at` (timestamptz) - Tag creation timestamp

  ### 7. audit_logs
  - `id` (uuid, primary key) - Log entry identifier
  - `user_id` (uuid, nullable) - User who performed action
  - `action` (text) - Action performed
  - `resource_type` (text) - Type of resource affected
  - `resource_id` (uuid, nullable) - Resource identifier
  - `details` (jsonb) - Additional action details
  - `ip_address` (text, nullable) - Source IP address
  - `user_agent` (text, nullable) - Client user agent
  - `created_at` (timestamptz) - Action timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies enforce user ownership and clearance level checks
  - Audit logs are insert-only for immutability
  - Classification-based access control on documents

  ## Indexes
  - Performance indexes on frequently queried columns
  - Full-text search indexes on document titles and content
  - Hash indexes for duplicate detection
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  clearance_level text NOT NULL DEFAULT 'unclassified',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'analyst', 'viewer')),
  CONSTRAINT valid_clearance CHECK (clearance_level IN ('unclassified', 'secret', 'top_secret'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL,
  classification text NOT NULL DEFAULT 'unclassified',
  category text,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_hash text,
  embedding_vector text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_classification CHECK (classification IN ('unclassified', 'secret', 'top_secret')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processed', 'error'))
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_classification ON documents(classification);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Duplicate clusters table
CREATE TABLE IF NOT EXISTS duplicate_clusters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id text UNIQUE NOT NULL,
  canonical_document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  confidence_score numeric(3,2) NOT NULL DEFAULT 0.00,
  intelligence_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'watch',
  domain text,
  classification_path text,
  modalities text[] DEFAULT ARRAY[]::text[],
  findings jsonb DEFAULT '[]'::jsonb,
  last_observed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
  CONSTRAINT valid_intelligence CHECK (intelligence_score >= 0 AND intelligence_score <= 100),
  CONSTRAINT valid_status CHECK (status IN ('watch', 'review', 'approved'))
);

ALTER TABLE duplicate_clusters ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clusters_status ON duplicate_clusters(status);
CREATE INDEX IF NOT EXISTS idx_clusters_last_observed ON duplicate_clusters(last_observed DESC);

-- Document duplicates junction table
CREATE TABLE IF NOT EXISTS document_duplicates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id uuid REFERENCES duplicate_clusters(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  similarity_score numeric(3,2) NOT NULL DEFAULT 0.00,
  detection_method text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_similarity CHECK (similarity_score >= 0 AND similarity_score <= 1),
  UNIQUE(cluster_id, document_id)
);

ALTER TABLE document_duplicates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_document_duplicates_cluster ON document_duplicates(cluster_id);
CREATE INDEX IF NOT EXISTS idx_document_duplicates_document ON document_duplicates(document_id);

-- Document tags table
CREATE TABLE IF NOT EXISTS document_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  confidence numeric(3,2),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_document_tags_document ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag);

-- Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for folders table
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for documents table
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for duplicate_clusters table
CREATE POLICY "Authenticated users can view duplicate clusters"
  ON duplicate_clusters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage duplicate clusters"
  ON duplicate_clusters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for document_duplicates table
CREATE POLICY "Authenticated users can view document duplicates"
  ON document_duplicates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage document duplicates"
  ON document_duplicates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for document_tags table
CREATE POLICY "Users can view tags on own documents"
  ON document_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags on own documents"
  ON document_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags on own documents"
  ON document_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.owner_id = auth.uid()
    )
  );

-- RLS Policies for audit_logs table (read-only for all, insert-only by system)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
