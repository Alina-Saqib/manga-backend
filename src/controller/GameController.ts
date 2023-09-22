import express, { Request, Response, Router } from 'express';
import Game from '../model/gameSchema';
import { shuffle } from "../config/shuffleHelpers"; 





export const NewGame= async (req: Request, res: Response) => {
    try {
        const {
          title,
          timestamps,
          gameCode,
          percentage,
          provider,
        } = req.body;

        const gameCodeArray = gameCode.split(',');
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
          }
        const game = new Game({
         image: req.file.buffer.toString('base64'),
          title,
          timestamps,
          gameCode: gameCodeArray,
          percentage,
          provider,
        });
        const savedGame = await game.save();
        res.json(savedGame);
      } catch (error) {
      
        res.status(500).json({ error: 'Could not create a game' });
      }
   
    }

    export const GetAllGame= async (req: Request, res: Response) => {
        try {
            const games = await Game.find();
            res.json(games);
          } catch (error) {
            res.status(500).json({ error: 'Could not fetch games' });
          }
   
    }

    export  const GetSingleGame= async (req: Request, res: Response) => {
        try {
            const game = await Game.findById(req.params.id);
            if (!game) {
              return res.status(404).json({ error: 'Game not found' });
            }
            res.json(game);
          } catch (error) {
            res.status(500).json({ error: 'Could not fetch the game' });
          }
    }

    export const UpdateGame = async (req: Request, res: Response) => {
      const gameId = req.params.id;
      const { position, image, title, timestamps, elements, percentage, provider } = req.body;
    
      try {
        const gameToUpdate = await Game.findById(gameId);
    
        if (!gameToUpdate) {
          return res.status(404).json({ message: 'Game not found' });
        }
    
        if (position !== undefined) {
          // Get the current position of the game
          const currentPosition = gameToUpdate.position;
    
          // Find all other games of the same GameProvider
          const gamesOfSameProvider = await Game.find({
            provider: gameToUpdate.provider,
          });
    
          // Update the positions of other games
          for (const game of gamesOfSameProvider) {
            if (game._id.toString() === gameId) {
              // Skip the game being updated
              continue;
            }
    
            if (currentPosition < position) {
              // Move other games down
              if (game.position > currentPosition && game.position <= position) {
                game.position--;
                await game.save();
              }
            } else {
              // Move other games up
              if (game.position >= position && game.position < currentPosition) {
                game.position++;
                await game.save();
              }
            }
          }
    
          // Update the position of the game being updated
          gameToUpdate.position = position;
        }
    
        // Update other fields if provided
        if (image !== undefined) {
          gameToUpdate.image = image;
        }
        if (title !== undefined) {
          gameToUpdate.title = title;
        }
        if (timestamps !== undefined) {
          gameToUpdate.timestamps = timestamps;
        }
        if (elements !== undefined) {
          gameToUpdate.elements = elements;
        }
        if (percentage !== undefined) {
          gameToUpdate.percentage = percentage;
        }
        if (provider !== undefined) {
          gameToUpdate.provider = provider;
        }
    
        await gameToUpdate.save();
    
        return res.json({ message: 'Game updated successfully' });
      } catch (error) {
       
        return res.status(500).json({ message: 'Server error' });
      }
    };
    

    export const DeleteGame = async (req: Request, res: Response) => {
      const gameId = req.params.id;
    
      try {
        // Find the game that is going to be deleted
        const deletedGame = await Game.findById(gameId);
    
        if (!deletedGame) {
          return res.status(404).json({ error: 'Game not found' });
        }
         
        // Get the position of the game that is going to be deleted
        const deletedGamePosition = deletedGame.position;
        
        // Find all other games of the same GameProvider with positions greater than the deleted game's position
        const gamesToUpdate = await Game.find({
          provider: deletedGame.provider,
          position: { $gt: deletedGamePosition },
        });

    
        // Delete the game
        await Game.findByIdAndRemove(gameId);
    
        // Update the positions of the remaining games
        for (const game of gamesToUpdate) {
          game.position -= 1; // Decrement the position
          await game.save();
        }
    
        res.json(deletedGame);
      } catch (error) {
        
        res.status(500).json({ error: 'Could not delete the game' });
      }
    };
    




// Shuffle all games
export const ShuffleAllGames = async (req: Request, res: Response) => {
  try {
    // Find all games
    const allGames = await Game.find();


    if (!allGames ||  allGames.length === 0) {
      return res.status(404).json({ error: 'No games found' });
    }

    // Shuffle values for each game
    for (const game of allGames) {
      game.gameCode = shuffle(game.gameCode);
      game.percentage = Math.random() * 100;

      // Shuffle timestampStart and timestampEnd for each object in the timestamps array
      game.timestamps.forEach((timestamp: any) => {
        const startDate = new Date();
        startDate.setHours(10, 15, 0, 0); // 10:15 AM
        const endDate = new Date();
        endDate.setHours(14, 23, 0, 0); // 2:23 PM

        const randomStartTime = new Date(
          startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
        );
        const randomEndTime = new Date(
          randomStartTime.getTime() +
          Math.random() * (endDate.getTime() - randomStartTime.getTime())
        );

        const startTime = `${randomStartTime.getHours()}:${randomStartTime.getMinutes()}`;
        const endTime = `${randomEndTime.getHours()}:${randomEndTime.getMinutes()}`;

        timestamp.start = startTime;
        timestamp.end = endTime;
      });

      await game.save();
    }

    return res.json({ message: 'All games shuffled successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};






 