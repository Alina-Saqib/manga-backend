import { NextFunction } from "express";

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  image: String,
  title: String,
  timestamps: [
    {
      start: String, 
      end: String,   
    },
  ],
  gameCode: [{ type: String }],
  percentage: { type: Number, min: 0, max: 100 },
  position: Number,
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameProvider',
  },
});

// Middleware to assign the position automatically before saving a new game
gameSchema.pre('save', async function (this: any ,next: NextFunction) {
  // Check if this is a new game (not an update)
  if (!this.isNew) {
    return next();
  }

  try {
    // Find the maximum position value for the current provider
    const maxPosition = await this.constructor.findOne({
      provider: this.provider,
    })
      .sort({ position: -1 }) // Sort in descending order to find the maximum
      .select('position');

    // Assign the next position value
    this.position = maxPosition ? maxPosition.position + 1 : 1;

    next();
  } catch (error) {
    next(error);
  }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;

