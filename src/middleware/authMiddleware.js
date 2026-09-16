import jwt from "jsonwebtoken"

const getJwtSecret = () => {
      if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured")
      }

      return process.env.JWT_SECRET
}

const authMiddleware = (req, res, next) => {
      const authorization = req.headers.authorization
      const token = authorization?.startsWith("Bearer ")
            ? authorization.slice(7)
            : null

      if (!token) {
            return res.status(401).json({
                  success: false,
                  message: "Authorization token is required",
            })
      }

      try {
            const payload = jwt.verify(token, getJwtSecret())

            if (payload.purpose !== "access" || !payload.userId) {
                  return res.status(401).json({
                        success: false,
                        message: "Invalid authorization token",
                  })
            }

            req.user = payload
            return next()
      } catch (error) {
            if (error.name === "TokenExpiredError") {
                  return res.status(401).json({
                        success: false,
                        message: "Authorization token has expired",
                  })
            }

            return res.status(401).json({
                  success: false,
                  message: "Invalid authorization token",
            })
      }
}

export default authMiddleware
