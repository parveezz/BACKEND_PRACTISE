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
            `SELECT uuid AS id, first_name, last_name, date_of_birth, gender, email, phone_number, created_at
             FROM users
             WHERE uuid = $1`,
            [userId],
      )

      return result.rows[0]
}
