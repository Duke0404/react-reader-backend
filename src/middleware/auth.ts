import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"
import { z } from "zod"

// Define the schema for the JWT payload
const jwtPayloadSchema = z.object({
	id: z.string()
})

interface AuthRequest extends Request {
	user?: string
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
	// Extract the token from the Authorization header or HTTP-only cookie
	const authToken = req.header("Authorization")?.split(" ")[1]
	const cookieToken = req.cookies?.token
	const token = authToken || cookieToken

	// If no token is provided, return a 401 Unauthorized response
	if (!token) {
		res.status(401).json({ message: "Unauthorized" })
		return
	}

	try {
		// Verify the token and decode its payload
		const decoded = verify(token, process.env.JWT_SECRET as string)

		// Validate the decoded payload using Zod
		const result = jwtPayloadSchema.safeParse(decoded)
		if (!result.success) {
			res.status(401).json({ message: "Invalid token payload" })
			return
		}

		// Attach the user ID to the request object
		req.user = result.data.id

		// Proceed to the next middleware or route handler
		next()
	} catch (err) {
		// Handle token verification errors
		console.error(err)
		res.status(401).json({ message: "Invalid token" })
	}
}
