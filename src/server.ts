import * as cookieParser from "cookie-parser"
import * as cors from "cors"
import * as dotenv from "dotenv"
import * as express from "express"

import connectDB from "./config/db"
import authRoutes from "./routes/auth"
import libraryRoutes from "./routes/library"
import ttsRoutes from "./routes/readAloud"
import translateRoutes from "./routes/translate"
import { initGridFS } from "./services/gridfs"
import mongoose from "mongoose"

dotenv.config()
connectDB()

// Initialize GridFS after MongoDB connects
mongoose.connection.once("open", () => {
	initGridFS()
})

const app = express()
app.use(cors({
	origin: process.env.FRONTEND_URL || "http://localhost:5173",
	credentials: true
}))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))

app.use("/auth", authRoutes)
app.use("/library", libraryRoutes)
app.use("/translate", translateRoutes)
app.use("/readAloud", ttsRoutes)

app.get("/health", (_, res) => {
    console.log("Health check URL was hit")
    res.send("Server is healthy")
})

const port = process.env.SERVER_PORT || 3000

app.listen(port, () => console.log(`Server running on port ${port} 🚀`))
