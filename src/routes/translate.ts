import { Request, Router } from "express"
import fetch from "node-fetch"
import { z } from "zod"

import { authenticateJWT } from "../middleware/auth"

const router = Router()

// Zod schema for the translation service languages response
const translationServiceLanguagesResponseSchema = z.array(
	z.object({
		code: z.string().length(2, "Language code must be a 2-letter code"),
		name: z.string().min(1, "Language name is required"),
		targets: z
			.array(z.string().length(2, "Language code must be a 2-letter code"))
			.min(1, "Language targets are required")
	})
)

// Get all target languages supported by the translation service
async function getLanguages() {
	// Call the translation service
	const response = await fetch(`${process.env.TRANSLATE_API_URL}/languages`)

	// Handle translation service errors
	if (!response.ok) {
		console.error("Failed to get languages:", response.statusText)
		throw new Error("Failed to get languages")
	}

	// Parse and validate the translation service response
	const data = await response.json()
	const responseValidation = translationServiceLanguagesResponseSchema.safeParse(data)

	if (!responseValidation.success) {
		console.error("Invalid response from translation service:", data)
		throw new Error("Invalid response from translation service")
	}

	// Get all target languages
	const languageSet = new Set<string>()
	for (const language of responseValidation.data) {
		for (const target of language.targets) {
			languageSet.add(target)
		}
	}

	return languageSet
}

router.get("/languages", authenticateJWT, async (_, res) => {
	try {
		// Get all target languages supported by the translation service
		const languageSet = await getLanguages()

		// Create a list of all target languages and send it in the response
		res.json({ languages: Array.from(languageSet) })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

// Zod schema for translate request body
const translateSchema = z.object({
	text: z.string().min(1, "Text is required"),
	targetLang: z.string().length(2, "Target language must be a 2-letter code")
})

// Zod schema for the translation service translate response
const translationServiceTranslateResponseSchema = z.object({
	translatedText: z.string().min(1, "Translated text is required")
})

interface TranslateRequest extends Request {
	body: z.infer<typeof translateSchema>
}

router.post("/", authenticateJWT, async (req: TranslateRequest, res) => {
	try {
		// Validate the request body using Zod
		const result = translateSchema.safeParse(req.body)
		if (!result.success) {
			res.status(400).json({ message: result.error.errors[0].message })
			return
		}

		const { text, targetLang } = result.data

		// Get all target languages supported by the translation service
		const languageSet = await getLanguages()

		// Check if the target language is supported
		if (!languageSet.has(targetLang)) {
			res.status(400).json({ message: "Target language is not supported" })
			return
		}

		// Call the translation service
		const response = await fetch(`${process.env.TRANSLATE_API_URL}/translate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				q: text,
				source: "auto",
				target: targetLang,
				format: "text"
			})
		})

		// Handle translation service errors
		if (!response.ok) {
			console.error("Failed to translate text:", response.statusText)
			res.status(500).json({ message: "Failed to translate text" })
			return
		}

		// Parse and validate the translation service response
		const data = await response.json()
		const responseValidation = translationServiceTranslateResponseSchema.safeParse(data)

		if (!responseValidation.success) {
			console.error("Invalid response from translation service:", data)
			res.status(500).json({ message: "Invalid response from translation service" })
			return
		}

		// Send the translated text in the response
		res.json({ translatedText: responseValidation.data.translatedText })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
})

export default router
