import { compare, hash } from "bcryptjs"
import { Request, Router, Response } from "express"
import { sign, verify } from "jsonwebtoken"
import { z } from "zod"

import User from "../models/User"

const router = Router()

// Define Zod schema
const authSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters long"),
	password: z.string().min(3, "Password must be at least 3 characters long")
})

interface AuthRequest extends Request {
	body: z.infer<typeof authSchema>
}

// Utility function to generate JWT
function generateToken(userId: string): string {
	return sign({ id: userId }, process.env.JWT_SECRET as string, {
		expiresIn: "30d"
	})
}

// Utility function to send a success response with a token set as HTTP-only cookie
function sendTokenResponse(res: Response, userId: string, message: string) {
	const token = generateToken(userId)
	
	// Set the JWT as an HTTP-only cookie
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // Use secure cookies for HTTPS in production
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-origin in production
		maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
	})
	
	res.status(201).json({ message })
}

// Register route
router.post("/register", async (req: AuthRequest, res) => {
	const requestId = Math.random().toString(36).substr(2, 9)
	try {
		console.log(`[${requestId}] Registration attempt:`, { 
			body: req.body, 
			origin: req.get('Origin'),
			userAgent: req.get('User-Agent'),
			timestamp: new Date().toISOString()
		})
		
		// Validate the request body
		const result = authSchema.safeParse(req.body)
		if (!result.success) {
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { username, password } = result.data

		// Check if the user already exists
		console.log(`[${requestId}] Checking if user exists:`, username)
		const existingUser = await User.findOne({ username })

		if (existingUser) {
			console.log(`[${requestId}] User already exists:`, username)
			res.status(400).json({ message: "User already exists" })
			return
		}

		// Hash the password and create a new user
		const hashedPassword = await hash(password, 10)
		const user = new User({ username, password: hashedPassword })

		// Save the user to the database
		console.log(`[${requestId}] Saving user to database:`, username)
		await user.save()
		console.log(`[${requestId}] User saved successfully:`, username)

		// Send a response with the JWT
		sendTokenResponse(res, user.id, "User created successfully")
	} catch (error: any) {
		console.error(`[${requestId}] Registration error:`, error.message)
		
		// Handle duplicate key error (username already exists)
		if (error.code === 11000) {
			console.log(`[${requestId}] Duplicate key error - user already exists`)
			res.status(400).json({ message: "Username already exists" })
			return
		}
		
		res.status(500).json({ message: "Server error" })
	}
})

// Login route
router.post("/login", async (req: AuthRequest, res) => {
	try {
		console.log('Login attempt:', { body: req.body, origin: req.get('Origin') })
		
		// Validate the request body
		const result = authSchema.safeParse(req.body)
		if (!result.success) {
			console.log('Validation failed:', result.error.errors)
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { username, password } = result.data

		// Check if the user exists
		const user = await User.findOne({ username })
		if (!user) {
			console.log('User not found:', username)
			res.status(401).json({ message: "Invalid credentials" })
			return
		}

		// Compare the provided password with the hashed password
		const isMatch = await compare(password, user.password)
		if (!isMatch) {
			res.status(401).json({ message: "Invalid credentials" })
			return
		}

		// Send a response with the JWT
		sendTokenResponse(res, user.id, "Login successful")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

// Validate route to check if the JWT token is valid
router.get("/validate", (req, res) => {
	// Extract the token from the HTTP-only cookie
	const token = req.cookies?.token
	
	// If no token is provided, return unauthorized
	if (!token) {
		res.status(401).json({ message: "No token provided" })
		return
	}
	
	try {
		// Verify the token
		const decoded = verify(token, process.env.JWT_SECRET as string) as { id: string }
		
		// Token is valid
		res.status(200).json({ message: "Token is valid", userId: decoded.id })
	} catch (err) {
		// Token is invalid or expired
		console.error(err)
		res.status(401).json({ message: "Invalid or expired token" })
	}
})

// Logout route to clear the HTTP-only cookie
router.post("/logout", (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // Use secure cookies for HTTPS in production
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // Allow cross-origin in production
	})
	res.status(200).json({ message: "Logout successful" })
})

export default router
