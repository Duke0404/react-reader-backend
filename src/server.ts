import * as cors from "cors"
import * as dotenv from "dotenv"
import * as express from "express"

import connectDB from "./config/db"
import authRoutes from "./routes/auth"
import ttsRoutes from "./routes/readAloud"
import translateRoutes from "./routes/translate"

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/translate", translateRoutes)
app.use("/readAloud", ttsRoutes)

app.get("/health", (_, res) => {
    console.log("Health check URL was hit")
    res.send("Server is healthy")
})

const port = process.env.SERVER_PORT || 3000

app.listen(port, () => console.log(`Server running on port ${port} 🚀`))
