import { Request, Router } from "express"
import fetch from "node-fetch"

import { authenticateJWT } from "../middleware/auth"

const router = Router()

interface TranslateRequest extends Request {
	body: {
		text: string
		targetLang: string
	}
}

interface TranslationServiceResponseData {
	translatedText: string
}

function isTranslationServiceResponseData(data: unknown): data is TranslationServiceResponseData {
	if (typeof data !== "object" || data === null) return false

	return (
		"translatedText" in data &&
		typeof (data as { translatedText: unknown }).translatedText === "string" &&
		(data as { translatedText: string }).translatedText.length > 0
	)
}

router.post("/", authenticateJWT, async (req: TranslateRequest, res) => {
	const { text, targetLang } = req.body

	if (!text || !targetLang) {
		res.status(400).json({ message: "Missing required fields" })
		return
	}

	const response = await fetch(`http://localhost:${process.env.TRANSLATE_API_PORT}/translate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			q: text,
			source: "auto",
			target: targetLang,
			format: "text"
		})
	})

	if (!response.ok) {
		res.status(500).json({ message: "Failed to translate text" })
		return
	}

	const data = await response.json()

	if (!isTranslationServiceResponseData(data)) {
		res.status(500).json({ message: "Failed to translate text" })
		return
	}

	res.json({ translatedText: data.translatedText })
})

export default router
