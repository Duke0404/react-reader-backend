import { Router, Request, Response } from "express"
import User from "../models/User"
import { authenticateJWT } from "../middleware/auth"
import { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } from "../services/gridfs"
import { ObjectId } from "mongodb"

const router = Router()

interface AuthRequest extends Request {
	user?: string
}

// GET /library - Get user's library
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user
		const user = await User.findById(userId)
		
		if (!user) {
			res.status(404).json({ message: "User not found" })
			return
		}
		
		// Download files from GridFS for each book
		const booksWithData = await Promise.all((user.library?.books || []).map(async (book: any) => {
			const [coverData, pdfData] = await Promise.all([
				downloadFromGridFS(book.coverGridFsId),
				downloadFromGridFS(book.dataGridFsId)
			])
			
			return {
				id: book.id,
				title: book.title,
				author: book.author,
				currentPage: book.currentPage,
				totalPages: book.totalPages,
				cover: coverData,
				data: pdfData,
				lastReadPage: book.lastReadPage,
				addTime: book.addTime,
				lastReadTime: book.lastReadTime,
				settings: book.settings
			}
		}))
		
		res.json({
			books: booksWithData,
			lastUpdated: user.library?.lastUpdated || 0
		})
	} catch (error) {
		console.error("Error fetching library:", error)
		res.status(500).json({ message: "Server error" })
	}
})

// PUT /library - Update entire library
router.put("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user
		const { books, lastUpdated } = req.body
		
		if (!books || !lastUpdated) {
			res.status(400).json({ message: "Missing books or lastUpdated" })
			return
		}
		
		const user = await User.findById(userId)
		if (!user) {
			res.status(404).json({ message: "User not found" })
			return
		}
		
		// Delete old GridFS files
		if (user.library?.books) {
			for (const oldBook of user.library.books) {
				await deleteFromGridFS((oldBook as any).coverGridFsId)
				await deleteFromGridFS((oldBook as any).dataGridFsId)
			}
		}
		
		// Upload new files to GridFS and create book metadata
		const booksMetadata = await Promise.all(books.map(async (book: any) => {
			const [coverGridFsId, dataGridFsId] = await Promise.all([
				uploadToGridFS(book.cover, `cover-${book.id}.jpg`),
				uploadToGridFS(book.data, `${book.title}.pdf`)
			])
			
			return {
				id: book.id,
				title: book.title,
				author: book.author,
				currentPage: book.currentPage,
				totalPages: book.totalPages,
				coverGridFsId,
				dataGridFsId,
				lastReadPage: book.lastReadPage,
				addTime: book.addTime,
				lastReadTime: book.lastReadTime,
				settings: book.settings
			}
		}))
		
		// Update user's library
		user.library = {
			books: booksMetadata as any,
			lastUpdated
		}
		
		await user.save()
		res.json({ message: "Library updated successfully" })
	} catch (error) {
		console.error("Error updating library:", error)
		res.status(500).json({ message: "Server error: " + error })
	}
})

// GET /library/timestamp - Get just the last updated timestamp
router.get("/timestamp", authenticateJWT, async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user
		const user = await User.findById(userId)
		
		if (!user) {
			res.status(404).json({ message: "User not found" })
			return
		}
		
		res.json({ lastUpdated: user.library?.lastUpdated || 0 })
	} catch (error) {
		console.error("Error fetching timestamp:", error)
		res.status(500).json({ message: "Server error" })
	}
})

export default router