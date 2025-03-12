import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"

interface AuthRequest extends Request {
	user?: string
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
	const token = req.header("Authorization")?.split(" ")[1]

	if (!token) {
		res.status(401).json({ message: "Unauthorized" })
		return
	}

	try {
		const decoded = verify(token, process.env.JWT_SECRET as string) as { id: string }
		req.user = decoded.id
		next()
	} catch (err) {
		res.status(401).json({ message: "Invalid token" })
	}
}
