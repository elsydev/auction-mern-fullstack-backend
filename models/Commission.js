import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema({
    amount: Number,
    user: mongoose.Schema.Types.ObjectId,
    createdAt: {
      type: Date,
      default: Date.now,
    },
})

const Commission = mongoose.model("Commission",commissionSchema);
export default Commission