import db from "../config/db.js"

export const createUserVideo = async (userId, videoUrl, cloudinaryPublicId, description, tags) => {
      const result = await db.query(`
            INSERT INTO user_videos (user_uuid, video_url, cloudinary_public_id, description, tags)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_uuid, video_url, cloudinary_public_id, description, tags, created_at
      `, [userId, videoUrl, cloudinaryPublicId, description, tags]);

      return result.rows[0]
}

export const getAllVideos = async (limit = 20, offset = 0, category = "", sortBy = "recent") => {
      let query = `
            SELECT v.id, v.video_url, v.description, v.tags, v.created_at, COALESCE(v.downloads, 0) as downloads, COALESCE(v.views, 0) as views,
                   u.uuid as author_id, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar,
                   (SELECT COUNT(id) FROM video_likes WHERE video_id = v.id) as likes_count
            FROM user_videos v
            JOIN users u ON v.user_uuid = u.uuid
      `;
      const queryParams = [limit, offset];

      if (category) {
            query += ` WHERE v.tags ILIKE $3 `;
            queryParams.push(`%${category}%`);
      }

      // Sorting logic
      let orderClause = ` ORDER BY v.created_at DESC`;
      if (sortBy === "popular") orderClause = ` ORDER BY downloads DESC, v.created_at DESC`;
      else if (sortBy === "liked") orderClause = ` ORDER BY likes_count DESC, v.created_at DESC`;
      else if (sortBy === "viewed") orderClause = ` ORDER BY views DESC, v.created_at DESC`;

      query += orderClause + ` LIMIT $1 OFFSET $2`;

      const result = await db.query(query, queryParams);
      return result.rows;
}

export const searchVideos = async (searchQuery, limit = 20, offset = 0) => {
      const searchTerm = `%${searchQuery}%`;
      const result = await db.query(`
            SELECT v.id, v.video_url, v.description, v.tags, v.created_at, COALESCE(v.downloads, 0) as downloads, COALESCE(v.views, 0) as views,
                   u.uuid as author_id, u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar
            FROM user_videos v
            JOIN users u ON v.user_uuid = u.uuid
            WHERE v.description ILIKE $1 
               OR v.tags ILIKE $1 
               OR u.first_name ILIKE $1 
               OR u.last_name ILIKE $1
            ORDER BY v.created_at DESC
            LIMIT $2 OFFSET $3
      `, [searchTerm, limit, offset]);
      return result.rows;
}

export const getUserVideos = async (userId, limit = 20, offset = 0) => {
      const result = await db.query(`
            SELECT v.id, v.video_url, v.description, v.tags, v.created_at, COALESCE(v.downloads, 0) as downloads, COALESCE(v.views, 0) as views
            FROM user_videos v
            WHERE v.user_uuid = $1
            ORDER BY v.created_at DESC
            LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);
      return result.rows;
}

export const getVideoById = async (videoId) => {
      const result = await db.query(`
            SELECT id, user_uuid, video_url, cloudinary_public_id, description, tags
            FROM user_videos
            WHERE id = $1
      `, [videoId]);
      return result.rows[0];
}

export const deleteVideo = async (videoId) => {
      await db.query(`
            DELETE FROM user_videos
            WHERE id = $1
      `, [videoId]);
}

export const updateVideoDetails = async (videoId, description, tags) => {
      const result = await db.query(`
            UPDATE user_videos
            SET description = COALESCE($1, description),
                tags = COALESCE($2, tags)
            WHERE id = $3
            RETURNING id, user_uuid, video_url, description, tags, created_at
      `, [description, tags, videoId]);
      return result.rows[0];
}

export const incrementVideoDownload = async (videoId) => {
      const result = await db.query(`
            UPDATE user_videos
            SET downloads = COALESCE(downloads, 0) + 1
            WHERE id = $1
            RETURNING id, downloads
      `, [videoId]);
      return result.rows[0];
}

export const incrementVideoView = async (videoId) => {
      const result = await db.query(`
            UPDATE user_videos
            SET views = COALESCE(views, 0) + 1
            WHERE id = $1
            RETURNING id, views
      `, [videoId]);
      return result.rows[0];
}

export const toggleVideoLike = async (userId, videoId) => {
      const existingLike = await db.query(`
            SELECT id FROM video_likes
            WHERE user_uuid = $1 AND video_id = $2
      `, [userId, videoId]);

      if (existingLike.rows.length > 0) {
            await db.query(`
                  DELETE FROM video_likes
                  WHERE user_uuid = $1 AND video_id = $2
            `, [userId, videoId]);
            return { action: "unliked" };
      } else {
            await db.query(`
                  INSERT INTO video_likes (user_uuid, video_id)
                  VALUES ($1, $2)
            `, [userId, videoId]);
            return { action: "liked" };
      }
}
