import * as cookieParser from "cookie-parser"
import * as cors from "cors"
import * as dotenv from "dotenv"
import * as express from "express"
import * as https from "https"
import * as fs from "fs"

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

// Configure CORS for multiple origins (including HTTPS localhost)
const allowedOrigins = [
	"http://localhost:5173", // Local development
	"http://localhost:3000", // Local preview HTTP
	"https://localhost:3443", // Local preview HTTPS
	"https://duke0404.github.io", // GitHub Pages
]

app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true)
		
		// Check if the origin is in our allowed list
		if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
			return callback(null, true)
		}
		
		// Reject the request
		const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
		return callback(new Error(msg), false)
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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

const httpPort = process.env.SERVER_PORT || 3000
const httpsPort = process.env.HTTPS_PORT || 3443

// Start HTTP server
app.listen(httpPort, () => console.log(`🔓 HTTP Server running on port ${httpPort}`))

// Start HTTPS server (if certificates exist)
try {
    const httpsOptions = {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
    }
    
    https.createServer(httpsOptions, app).listen(httpsPort, () => {
        console.log(`🔐 HTTPS Server running on port ${httpsPort}`)
        console.log(`📋 Use https://localhost:${httpsPort} for secure cross-origin cookies`)
    })
} catch (error) {
    console.log(`⚠️  HTTPS certificates not found, running HTTP only`)
    console.log(`💡 HTTPS would be available on port ${httpsPort} with certificates`)
}