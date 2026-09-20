-- Adds the fields and relations used by src/model/imageModel.js.
-- Every statement is safe to run on an existing database.

ALTER TABLE user_images
      ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS downloads INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS image_likes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
      image_id UUID NOT NULL REFERENCES user_images(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT image_likes_user_image_unique UNIQUE (user_uuid, image_id)
);

CREATE TABLE IF NOT EXISTS image_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
      image_id UUID NOT NULL REFERENCES user_images(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS image_ratings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
      image_id UUID NOT NULL REFERENCES user_images(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT image_ratings_user_image_unique UNIQUE (user_uuid, image_id)
);

CREATE INDEX IF NOT EXISTS user_images_created_at_idx
      ON user_images (created_at DESC);
CREATE INDEX IF NOT EXISTS image_likes_image_id_idx
      ON image_likes (image_id);
CREATE INDEX IF NOT EXISTS image_comments_image_id_idx
      ON image_comments (image_id);
CREATE INDEX IF NOT EXISTS image_ratings_image_id_idx
      ON image_ratings (image_id);
