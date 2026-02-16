import mongoose from "mongoose";
const boardSchema = new mongoose.Schema({
    name:{
        type: String,
        default: "board-1"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    history: {
        type: Array,
        default: []
    }
});

export default mongoose.model("Board", boardSchema);