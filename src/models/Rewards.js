const mongoose = require("mongoose");

const { Schema } = mongoose;

const RewardsSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  income: { type: Number, required: true },
  withdraw: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }
});

RewardsSchema.statics.getByUser = async function(id) {
  return await this.find({ userId: id }, { __v: 0, userId: 0 });
};

mongoose.model("Rewards", RewardsSchema);
