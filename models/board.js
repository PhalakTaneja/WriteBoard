import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    history: [{
        x: Number,
        y: Number,
        type: {
            type: String,
            enum: ['begin', 'draw', 'end']
        }
    }]
});

export default mongoose.model('Board', boardSchema);