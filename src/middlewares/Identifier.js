
/** 
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();


export function identifier(req, res, next) {
    const authHeader = req.headers.authorization;

    // Debugging logs (optional, remove in production)
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    const token = authHeader.split(' ')[1].trim();

    try {
        const jwtVerified = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        req.user = jwtVerified;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

 */

import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export function authenticateToken(request, response, next) {
    const token = request.cookies['accessToken'] || request.headers['authorization']?.split(' ')[1];
    if (!token) {
        return response.status(401)
        .json({
            message: 'Authorization/Login is required',
            success: false
        })
    }
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
        if (err) {
            return response.status(403)
            .json({
                message: "Invalid or expired accessToken"
            });
        }
        request.user = user;
        next();
    });
}
export default authenticateToken;