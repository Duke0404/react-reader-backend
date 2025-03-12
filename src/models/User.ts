import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, min: 3 },
	password: { type: String, required: true, min: 3 }
})

export default mongoose.model("User", UserSchema)
