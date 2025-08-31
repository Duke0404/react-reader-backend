import mongoose from "mongoose"
import { GridFSBucket, ObjectId } from "mongodb"

let gridFSBucket: GridFSBucket

// Initialize GridFS bucket
export function initGridFS() {
	const db = mongoose.connection.db
	if (!db) {
		throw new Error("Database not connected")
	}
	gridFSBucket = new GridFSBucket(db, {
		bucketName: "books"
	})
	console.log("GridFS initialized")
}

// Upload file to GridFS
export async function uploadToGridFS(
	base64Data: string | null,
	filename: string
): Promise<ObjectId | null> {
	if (!base64Data) return null
	
	if (!gridFSBucket) {
		throw new Error("GridFS not initialized")
	}
	
	try {
		// Convert base64 to buffer
		const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
		const buffer = matches ? Buffer.from(matches[2], "base64") : Buffer.from(base64Data, "base64")
		
		// Create upload stream
		const uploadStream = gridFSBucket.openUploadStream(filename)
		const id = uploadStream.id
		
		// Write buffer and close stream
		await new Promise((resolve, reject) => {
			uploadStream.on("error", reject)
			uploadStream.on("finish", () => resolve(id))
			uploadStream.end(buffer)
		})
		
		return id
	} catch (error) {
		console.error("Error uploading to GridFS:", error)
		return null
	}
}

// Download file from GridFS
export async function downloadFromGridFS(fileId: ObjectId | null): Promise<string | null> {
	if (!fileId) return null
	
	if (!gridFSBucket) {
		throw new Error("GridFS not initialized")
	}
	
	try {
		const downloadStream = gridFSBucket.openDownloadStream(fileId)
		
		// Read stream to buffer
		const chunks: Buffer[] = []
		
		return new Promise((resolve, reject) => {
			downloadStream.on("data", (chunk) => chunks.push(chunk))
			downloadStream.on("error", reject)
			downloadStream.on("end", () => {
				const buffer = Buffer.concat(chunks)
				// Convert to base64 with data URI prefix
				const base64 = `data:application/octet-stream;base64,${buffer.toString("base64")}`
				resolve(base64)
			})
		})
	} catch (error) {
		console.error("Error downloading from GridFS:", error)
		return null
	}
}

// Delete file from GridFS
export async function deleteFromGridFS(fileId: ObjectId | null): Promise<void> {
	if (!fileId) return
	
	if (!gridFSBucket) {
		throw new Error("GridFS not initialized")
	}
	
	try {
		await gridFSBucket.delete(fileId)
	} catch (error) {
		console.error("Error deleting from GridFS:", error)
	}
}
