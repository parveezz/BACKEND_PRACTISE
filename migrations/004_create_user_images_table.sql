CREATE TABLE IF NOT EXISTS user_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      cloudinary_public_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS user_images_user_uuid_idx
ON user_images(user_uuid);