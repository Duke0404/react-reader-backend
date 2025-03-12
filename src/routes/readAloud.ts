import { Request, Router } from "express"
import fetch from "node-fetch"

import { authenticateJWT } from "../middleware/auth"

const router = Router()

interface ReadAloudRequest extends Request {
	body: {
		text: string
	}
}

router.post("/", authenticateJWT, async (req: ReadAloudRequest, res) => {
	const { text } = req.body

	const response = await fetch(`${process.env.TTS_API_URL}/synthesize`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text, voice: "en_US-ryan-high" })
	})

	const audioBuffer = await response.arrayBuffer()
	res.set("Content-Type", "audio/wav")
	res.send(Buffer.from(audioBuffer))
})

export default router
