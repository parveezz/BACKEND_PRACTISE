    import db from "../config/db.js";

export const createContact = async (name, email, subject, message) => {
    const result = await db.query(`
        INSERT INTO contacts (name, email, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [name, email, subject, message]);
    return result.rows[0];
};

export const subscribeNewsletter = async (email) => {
    const result = await db.query(`
        INSERT INTO newsletters (email)
        VALUES ($1)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
    `, [email]);
    return result.rows[0];
};

export const createFeedback = async (userUuid, rating, comments) => {
    const result = await db.query(`
        INSERT INTO feedbacks (user_uuid, rating, comments)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [userUuid, rating, comments]);
    return result.rows[0];
};

