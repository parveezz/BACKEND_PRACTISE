ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'users_status_check'
	) THEN
		ALTER TABLE users
		ADD CONSTRAINT users_status_check
		CHECK (status IN ('active', 'suspended', 'inactive'));
	END IF;
END $$;