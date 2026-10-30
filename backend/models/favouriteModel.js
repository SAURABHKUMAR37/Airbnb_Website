import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'home', required: true },
  },
  { timestamps: true }
);

favouriteSchema.index({ user: 1, home: 1 }, { unique: true });

export default mongoose.models.favourite || mongoose.model('favourite', favouriteSchema);
