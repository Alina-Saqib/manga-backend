import express from 'express';
import {NewGame, GetAllGame,GetSingleGame,UpdateGame,DeleteGame, ShuffleAllGames} from '../controller/GameController';
import upload from '../middleware/multer';

const router = express.Router();

// Create a new game
router.post('/',upload.single('image'), NewGame);
  
  // Get all games
  router.get('/', GetAllGame);
  
  // Get a single game by ID
  router.get('/:id', GetSingleGame );
  
  // Update a game by ID
  router.put('/Update/:id', UpdateGame );
  
  // Delete a game by ID
  router.delete('/:id', DeleteGame);


  router.put('/shuffle', ShuffleAllGames);

 




  

export default router;
