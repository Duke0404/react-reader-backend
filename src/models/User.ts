import mongoose from "mongoose"

const BookSchema = new mongoose.Schema({
	id: Number,
	title: String,
	author: String,
	currentPage: Number,
	totalPages: Number,
	coverGridFsId: mongoose.Schema.Types.ObjectId, // GridFS ID for cover image
	dataGridFsId: mongoose.Schema.Types.ObjectId, // GridFS ID for PDF data
	lastReadPage: Number,
	addTime: Number,
	lastReadTime: Number,
	settings: {
		bionic: {
			on: Boolean,
			highlightSize: Number,
			highlightJump: Number,
			highlightMultiplier: Number,
			lowlightOpacity: Number
		},
		readAloud: {
			on: Boolean,
			localAlways: Boolean,
			playFullPage: Boolean
		},
		readingDirection: String,
		scale: Number,
		colorMode: {
			on: Boolean,
			mode: String
		}
	}
})

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, min: 3 },
	password: { type: String, required: true, min: 3 },
	library: {
		books: [BookSchema],
		lastUpdated: { type: Number, default: 0 }
	}
})

export default mongoose.model("User", UserSchema)