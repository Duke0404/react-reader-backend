import { compare, hash } from "bcryptjs"
import { Request, Router } from "express"
import { sign } from "jsonwebtoken"
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

// Utility function to send a success response with a token
function sendTokenResponse(res: any, userId: string, message: string) {
	const token = generateToken(userId)
	res.status(201).json({ message, token })
}

// Register route
router.post("/register", async (req: AuthRequest, res) => {
	try {
		// Validate the request body
		const result = authSchema.safeParse(req.body)
		if (!result.success) {
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { username, password } = result.data

		// Check if the user already exists
		const existingUser = await User.findOne({ username })
		if (existingUser) {
			res.status(400).json({ message: "User already exists" })
			return
		}

		// Hash the password and create a new user
		const hashedPassword = await hash(password, 10)
		const user = new User({ username, password: hashedPassword })

		// Save the user to the database
		await user.save()

		// Send a response with the JWT
		sendTokenResponse(res, user.id, "User created successfully")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

// Login route
router.post("/login", async (req: AuthRequest, res) => {
	try {
		// Validate the request body
		const result = authSchema.safeParse(req.body)
		if (!result.success) {
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { username, password } = result.data

		// Check if the user exists
		const user = await User.findOne({ username })
		if (!user) {
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

export default router
