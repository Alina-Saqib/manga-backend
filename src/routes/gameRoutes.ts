import express from 'express';
import {NewGame, GetAllGame,GetSingleGame,UpdateGame,DeleteGame, ShuffleAllGames, GetSingleProviderGame, UpdateTitle} from '../controller/GameController';
import upload from '../middleware/multer';

const router = express.Router();

// Create a new game
router.post('/',upload.single('image'), NewGame);
  
  // Get all games
  router.get('/', GetAllGame);

  router.get('/getGames', GetSingleProviderGame );
  
  // Get a single game by ID
  router.get('/:id', GetSingleGame );
  
  // Update a game by ID
  router.put('/Update/:id',upload.single('image'), UpdateGame );
  
  // Delete a game by ID
  router.delete('/:id', DeleteGame);


  router.put('/shuffle', ShuffleAllGames);

  router.put('/UpdateTitle', UpdateTitle);

 




  

export default router;
