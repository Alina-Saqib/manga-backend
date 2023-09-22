
const mongoose = require('mongoose');

const gameProviderSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const GameProvider = mongoose.model('GameProvider', gameProviderSchema);

export default GameProvider;
