import db from "../config/db.js"

export const createUser = async ({ firstName, lastName, dateOfBirth, gender, email, number, passwordHash }) => {
      const result = await db.query(
            `INSERT INTO users
                  (first_name, last_name, date_of_birth, gender, email, phone_number, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING uuid AS id, first_name, last_name, date_of_birth, gender, email, phone_number, created_at`,
            [firstName, lastName, dateOfBirth, gender, email, number, passwordHash],
      )

      return result.rows[0]
}

export const uniqueEmail = async (email) => {
      const result = await db.query(
            `SELECT uuid FROM users WHERE email = $1`,
            [email]
      )

      return result.rowCount === 0
}

export const findUserByEmail = async (email) => {
      const result = await db.query(
            `SELECT uuid AS id, first_name, last_name, date_of_birth, gender, email, phone_number, password_hash, created_at
             FROM users
             WHERE email = $1`,
            [email],
      )

      return result.rows[0]
}

export const saveResetToken = async (userId, tokenHash, expiresAt) => {
      await db.query(
            `UPDATE users
             SET reset_otp = $1, reset_otp_expires_at = $2
             WHERE uuid = $3`,
            [tokenHash, expiresAt, userId],
      )
}

export const findUserForReset = async (userId) => {
      const result = await db.query(
            `SELECT uuid AS id, reset_otp AS reset_token_hash FROM users
             WHERE uuid = $1 AND reset_otp_expires_at > NOW()`,
            [userId],
      )

      return result.rows[0]
}

export const updatePassword = async (userId, passwordHash) => {
      await db.query(
            `UPDATE users
             SET password_hash = $1, reset_otp = NULL, reset_otp_expires_at = NULL
             WHERE uuid = $2`,
            [passwordHash, userId],
      )
}

export const findUserById = async (userId) => {
      const result = await db.query(
            `SELECT uuid AS id, first_name, last_name, date_of_birth, gender, email, phone_number, avatar_url, created_at
             FROM users
             WHERE uuid = $1`,
            [userId],
      )

      return result.rows[0]
}

// Return user records without passwords or reset-token fields.
export const getUsers = async () => {
      const result = await db.query(`
      SELECT uuid AS id, first_name, last_name, date_of_birth, gender,
             email, phone_number, status, avatar_url, deleted_at, created_at, updated_at
      FROM users
            `);
      return result.rows
}

// Permanently remove the user row from the database.
export const permanentlyDeleteUser = async (userId) => {
      const result = await db.query(`
            DELETE FROM users
            WHERE uuid = $1
            RETURNING uuid AS id, first_name, last_name, email
            `, [userId])

      return result.rows[0]
}

// Update only the fields supplied by the caller; COALESCE keeps other values.
export const updateSingleUser = async (userId, { firstName, lastName, dateOfBirth, gender, email, number }) => {
      const result = await db.query(`
            UPDATE users
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                date_of_birth = COALESCE($3, date_of_birth),
                gender = COALESCE($4, gender),
                email = COALESCE($5, email),
                phone_number = COALESCE($6, phone_number),
                updated_at = NOW()
            WHERE uuid = $7
            RETURNING uuid AS id, first_name, last_name, date_of_birth,
                      gender, email, phone_number, avatar_url, status, created_at, updated_at
      `, [firstName, lastName, dateOfBirth, gender, email, number, userId]);

      return result.rows[0]
}

// Soft-delete the user by marking the account inactive instead of removing it.
export const softDeleteUser = async (userId) => {
      const result = await db.query(
            `UPDATE users
             SET status = 'inactive', deleted_at = NOW()
             WHERE uuid = $1
             RETURNING uuid AS id, first_name, last_name, email, status, deleted_at
            `, [userId]
      )

      return result.rows[0]
}

// Temporarily suspend an active user while keeping the account data.
export const suspendUser = async (userId) => {
      const result = await db.query(
            `UPDATE users
             SET status = 'suspended'
             WHERE uuid = $1 AND status = 'active'
             RETURNING uuid AS id, first_name, last_name, email, status
            `, [userId]
      )

      return result.rows[0]
}

// Reactivate a soft-deleted user and clear its deletion timestamp.
export const restoreUser = async (userId) => {
      const result = await db.query(
            `UPDATE users
             SET status = 'active', deleted_at = NULL
             WHERE uuid = $1 AND status = 'inactive'
             RETURNING uuid AS id, first_name, last_name, email, status, deleted_at
            `, [userId]
      )

      return result.rows[0]
}

export const createUserImage = async (userId, imageUrl, cloudinaryPublicId, description, tags) => {
      const result = await db.query(`
            INSERT INTO user_images (user_uuid, image_url, cloudinary_public_id, description, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_uuid, image_url, cloudinary_public_id, description, tags, created_at
      `, [userId, imageUrl, cloudinaryPublicId, description, tags]);

      return result.rows[0]
}

export const getAllImages = async (limit = 20, offset = 0) => {
      const result = await db.query(`
            SELECT i.id, i.image_url, i.description, i.tags, i.created_at,
                   u.uuid as author_id, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar
            FROM user_images i
            JOIN users u ON i.user_uuid = u.uuid
            ORDER BY i.created_at DESC
            LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
}

export const getUserImages = async (userId, limit = 20, offset = 0) => {
      const result = await db.query(`
            SELECT i.id, i.image_url, i.description, i.tags, i.created_at
            FROM user_images i
            WHERE i.user_uuid = $1
            ORDER BY i.created_at DESC
            LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);
      return result.rows;
}

export const getImageById = async (imageId) => {
      const result = await db.query(`
            SELECT id, user_uuid, image_url, cloudinary_public_id, description, tags
            FROM user_images
            WHERE id = $1
      `, [imageId]);
      return result.rows[0];
}

export const deleteImage = async (imageId) => {
      await db.query(`
            DELETE FROM user_images
            WHERE id = $1
      `, [imageId]);
}

export const updateImageDetails = async (imageId, description, tags) => {
      const result = await db.query(`
            UPDATE user_images
            SET description = COALESCE($1, description),
                tags = COALESCE($2, tags)
            WHERE id = $3
            RETURNING id, user_uuid, image_url, description, tags, created_at
      `, [description, tags, imageId]);
      return result.rows[0];
}

export const updateUserAvatar = async (userId, avatarUrl, avatarPublicId) => {
      const result = await db.query(`
            UPDATE users
            SET avatar_url = $1, avatar_public_id = $2, updated_at = NOW()
            WHERE uuid = $3
            RETURNING uuid AS id, first_name, last_name, email, avatar_url
      `, [avatarUrl, avatarPublicId, userId]);

      return result.rows[0];
}