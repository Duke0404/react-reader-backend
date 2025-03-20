import { Request, Router } from "express"
import fetch from "node-fetch"
import { z } from "zod"

import { authenticateJWT } from "../middleware/auth"

const router = Router()

// Define Zod schema for the request body
const readAloudSchema = z.object({
	text: z.string().min(1, "Text is required")
})

interface ReadAloudRequest extends Request {
	body: z.infer<typeof readAloudSchema>
}

router.post("/", authenticateJWT, async (req: ReadAloudRequest, res) => {
	try {
		// Validate the request body using Zod
		const result = readAloudSchema.safeParse(req.body)
		if (!result.success) {
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { text } = result.data

		// Call the TTS API
		const response = await fetch(process.env.TTS_API_URL as string, {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: text
		})

		// Handle TTS API errors
		if (!response.ok) {
			console.error("Failed to generate audio:", response.statusText)
			res.status(500).json({ message: "Failed to generate audio" })
			return
		}

		// Get the audio buffer from the response
		const audioBuffer = await response.arrayBuffer()

		// Send the audio buffer in the response
		res.set("Content-Type", "audio/wav")
		res.send(Buffer.from(audioBuffer))
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

export default router
