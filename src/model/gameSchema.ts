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
  gameCodeIntegers: [{ type: Number }], 
  gameCode: [{ type: String }],
  percentage: { type: Number, min: 0, max: 100 },
  position: Number,
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameProvider',
  },
});


gameSchema.pre('save', async function (this: any ,next: NextFunction) {
 
  if (!this.isNew) {
    return next();
  }

  try {
    
    const maxPosition = await this.constructor.findOne({
      provider: this.provider,
    })
      .sort({ position: -1 }) 
      .select('position');

   
    this.position = maxPosition ? maxPosition.position + 1 : 1;

    next();
  } catch (error) {
    next(error);
  }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;

