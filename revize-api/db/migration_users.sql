-- Migration script to add users table and related functionality

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'technician',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, name, email, role) 
VALUES ('admin', '$2b$10$abcdefghijABCDEFGHIJabcdefghij', 'Administrator', 'admin@example.com', 'admin');

-- Insert default revision technician (password: revize123)
INSERT INTO users (username, password, name, email, role) 
VALUES ('revizni.technik', '$2b$10$klmnopqrstKLMNOPQRSTklmnopqrst', 'Jan Revizní', 'revize@example.com', 'revision_technician');

-- Insert default technician (password: technik123)
INSERT INTO users (username, password, name, email, role) 
VALUES ('technik', '$2b$10$uvwxyz1234UVWXYZ1234uvwxyz1234', 'Petr Technický', 'technik@example.com', 'technician');