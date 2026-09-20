import db from "../config/db.js"

export const createUserImage = async (userId, imageUrl, cloudinaryPublicId, description, tags) => {
      const result = await db.query(`
            INSERT INTO user_images (user_uuid, image_url, cloudinary_public_id, description, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_uuid, image_url, cloudinary_public_id, description, tags, created_at
      `, [userId, imageUrl, cloudinaryPublicId, description, tags]);

      return result.rows[0]
}

export const getAllImages = async (limit = 20, offset = 0, category = "", sortBy = "recent") => {
      let query = `
            SELECT i.id, i.image_url, i.description, i.tags, i.created_at, COALESCE(i.downloads, 0) as downloads, COALESCE(i.views, 0) as views,
                   u.uuid as author_id, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar,
                   (SELECT COUNT(id) FROM image_likes WHERE image_id = i.id) as likes_count,
                   (SELECT COUNT(id) FROM image_comments WHERE image_id = i.id) as comments_count,
                   (SELECT COALESCE(AVG(rating), 0) FROM image_ratings WHERE image_id = i.id) as average_rating
            FROM user_images i
            JOIN users u ON i.user_uuid = u.uuid
      `;
      const queryParams = [limit, offset];

      if (category) {
            query += ` WHERE i.tags ILIKE $3 `;
            queryParams.push(`%${category}%`);
      }

      // Sorting logic
      let orderClause = ` ORDER BY i.created_at DESC`;
      if (sortBy === "popular") orderClause = ` ORDER BY downloads DESC, i.created_at DESC`;
      else if (sortBy === "rated") orderClause = ` ORDER BY average_rating DESC, i.created_at DESC`;
      else if (sortBy === "liked") orderClause = ` ORDER BY likes_count DESC, i.created_at DESC`;
      else if (sortBy === "viewed") orderClause = ` ORDER BY views DESC, i.created_at DESC`;
      else if (sortBy === "commented") orderClause = ` ORDER BY comments_count DESC, i.created_at DESC`;

      query += orderClause + ` LIMIT $1 OFFSET $2`;

      const result = await db.query(query, queryParams);
      return result.rows;
}

export const searchImages = async (searchQuery, limit = 20, offset = 0) => {
      const searchTerm = `%${searchQuery}%`;
      const result = await db.query(`
            SELECT i.id, i.image_url, i.description, i.tags, i.created_at, i.downloads,
                   u.uuid as author_id, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar
            FROM user_images i
            JOIN users u ON i.user_uuid = u.uuid
            WHERE i.description ILIKE $1 
               OR i.tags ILIKE $1 
               OR u.first_name ILIKE $1 
               OR u.last_name ILIKE $1
            ORDER BY i.created_at DESC
            LIMIT $2 OFFSET $3
      `, [searchTerm, limit, offset]);
      return result.rows;
}

export const getUserImages = async (userId, limit = 20, offset = 0) => {
      const result = await db.query(`
            SELECT i.id, i.image_url, i.description, i.tags, i.created_at, i.downloads
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

export const incrementDownload = async (imageId) => {
      const result = await db.query(`
            UPDATE user_images
            SET downloads = COALESCE(downloads, 0) + 1
            WHERE id = $1
            RETURNING id, downloads
      `, [imageId]);
      return result.rows[0];
}

export const incrementView = async (imageId) => {
      const result = await db.query(`
            UPDATE user_images
            SET views = COALESCE(views, 0) + 1
            WHERE id = $1
            RETURNING id, views
      `, [imageId]);
      return result.rows[0];
}

export const toggleLike = async (userId, imageId) => {
      // Check if it's already liked
      const existingLike = await db.query(`
            SELECT id FROM image_likes
            WHERE user_uuid = $1 AND image_id = $2
      `, [userId, imageId]);

      if (existingLike.rows.length > 0) {
            // Unlike
            await db.query(`
                  DELETE FROM image_likes
                  WHERE user_uuid = $1 AND image_id = $2
            `, [userId, imageId]);
            return { action: "unliked" };
      } else {
            // Like
            await db.query(`
                  INSERT INTO image_likes (user_uuid, image_id)
                  VALUES ($1, $2)
            `, [userId, imageId]);
            return { action: "liked" };
      }
}

