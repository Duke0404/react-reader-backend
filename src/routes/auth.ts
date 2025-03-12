import { compare, hash } from "bcryptjs"
import { Request, Router } from "express"
import { sign } from "jsonwebtoken"
import ms from "ms"

import User from "../models/User"

const router = Router()

interface AuthRequest extends Request {
	body: {
		username: string
		password: string
	}
}

// Register route
router.post("/register", async (req: AuthRequest, res) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			res.status(400).json({ message: "Username and password are required" })
			return
		}

		const existingUser = await User.findOne({ username })
		if (existingUser) {
			res.status(400).json({ message: "User already exists" })
			return
		}

		const hashedPassword = await hash(password, 10)
		const user = new User({ username, password: hashedPassword })

		await user.save()
		res.status(201).json({ message: "User created successfully" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

// Login route
router.post("/login", async (req: AuthRequest, res) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			res.status(400).json({ message: "Username and password are required" })
			return
		}

		const user = await User.findOne({ username })
		if (!user) {
			res.status(401).json({ message: "Invalid credentials" })
			return
		}

		const isMatch = await compare(password, user.password)
		if (!isMatch) {
			res.status(401).json({ message: "Invalid credentials" })
			return
		}

		const token = sign({ id: user.id }, process.env.JWT_SECRET as string, {
			expiresIn: process.env.JWT_EXPIRE as ms.StringValue
		})

		res.json({ token })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

export default router
