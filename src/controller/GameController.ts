import express, { Request, Response, Router } from 'express';
import Game from '../model/gameSchema';
import GameProvider from '../model/gameProvider';
import { shuffle } from "../config/shuffleHelpers"; 
import FtpClient from 'ftp-ts';
const ftp = new FtpClient();



require('dotenv').config(); 

const ftpConfig = {
  Ip: process.env.FTP_IP,
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT!), 
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  path: process.env.FTP_PATH,
};






export const NewGame= async (req: Request, res: Response) => {
    try {
        const {
          title,
          timestamps,
          gameCode,
          gameCodeIntegers,
          percentage,
          provider,
        } = req.body;

        const gameCodeArray = gameCode.split(',');
        const gameCodeIntegersArray = gameCodeIntegers.split(',');
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
          }

        const providerName = await getProviderName(provider);
        console.log(providerName)

          if (!providerName) {
            return res.status(400).json({ error: 'Invalid provider ID' });
          }

        const imageURL = await uploadImageToFTP(req.file,providerName);
        const game = new Game({
         image: imageURL,
          title,
          timestamps,
          gameCode: gameCodeArray,
          gameCodeIntegers: gameCodeIntegersArray ,
          percentage,
          provider,
        });
        const savedGame = await game.save();
        res.json(savedGame);
      } catch (error) {
       console.log(error)
        res.status(500).json({ error: 'Could not create a game' });
      }
   
    }


    function uploadImageToFTP(file: Express.Multer.File | undefined, providerName: String): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        if (!file) {
          reject(new Error('No Image provided'));
          return;
        }
    
        let ftpImagePath = '';
    
        ftp.connect(ftpConfig)
          .then(() => {
            return ftp.cwd(`/public_html/IDN GAME/${providerName}/`);
          })
          .then(() => {
            // Use a unique file name or modify as needed
            ftpImagePath = `GameImage_${file.originalname}`;
            return ftp.put(file.buffer, ftpImagePath);
          })
          .then(() => {
            ftp.end();
            resolve(`/IDN GAME/${providerName}/${ftpImagePath}`);
          })
          .catch((err) => {
            ftp.end();
            reject(err);
          });
      });
    }

    async function getProviderName(providerId: string): Promise<string | null> {
      const providerName = await GameProvider.findById(providerId);
      return providerName ? providerName.name : null;
    }
    export const GetAllGame= async (req: Request, res: Response) => {
        try {
            const games = await Game.find();
            res.json(games);
          } catch (error) {
            res.status(500).json({ error: 'Could not fetch games' });
          }
   
    }


   

export const GetSingleProviderGame = async (req: Request, res: Response) => {
  try {
    const { providerId, page = 1, limit = 10 } = req.query;

    // Parse page and limit as integers
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Define options for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Create a query to filter games by providerId
    const query = providerId ? { provider: providerId } : {};

    // Use Mongoose to query the games based on the filter and apply pagination
    const games = await Game.find(query)
      .sort({position: 1})
      .skip(skip)
      .limit(limitNumber)
      .exec();

    // Count the total number of games matching the filter
    const totalGames = await Game.countDocuments(query);

    res.json({
      games: games,
      totalGames: totalGames,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalGames / limitNumber),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Could not fetch games' });
  }
};


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
      const { position, title, timestamps, elements, percentage, provider } = req.body;
      let imageURL;
      const gameToUpdate = await Game.findById(gameId);
   
      const providerName = await getProviderName(gameToUpdate.provider);

      if (!providerName) {
        return res.status(400).json({ error: 'Invalid provider ID' });
      }

      if (req.file) {
        imageURL  = await uploadImageToFTP(req.file,providerName);
      }
      
      
      try {
       

        
    
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
        if (imageURL !== undefined) {
          gameToUpdate.image =  imageURL 
        }
        if (title !== undefined) {
          gameToUpdate.title = title;
        }
        if (timestamps !== undefined) {
          gameToUpdate.timestamps = timestamps 
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
       console.log(error)
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


          
    // Step 2: Delete the associated image from the FTP server
    const imagePath = deletedGame.image; 
    if (imagePath) {
      try {
        await ftp.connect(ftpConfig);
        await ftp.delete(`/public_html/${imagePath}`);
        await ftp.end(); 
      } catch (ftpError) {
        console.error('Error deleting image from FTP:', ftpError);
        
      }
    }
      
    
        // Delete the game
        await Game.findByIdAndRemove(gameId);
    
        // Update the positions of the remaining games
        for (const game of gamesToUpdate) {
          game.position -= 1; // Decrement the position
          await game.save();
        }
    
        res.json(deletedGame);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Could not delete the game' });
      }
    };
    




    export const ShuffleAllGames = async (req: Request, res: Response) => {
      try {
        const providerIdToShuffle = req.query.providerId;
    
        if (!providerIdToShuffle) {
          return res.status(400).json({ error: 'Provider ID is required in the query parameter' });
        }
    
        // Find all games
        const allGames = await Game.find({ provider: providerIdToShuffle });
    
        if (!allGames || allGames.length === 0) {
          return res.status(404).json({ error: 'No games found' });
        }
    
        // Shuffle values for each game
        for (const game of allGames) {
          game.gameCode = shuffle(game.gameCode);
    
          if (!game.gameCodeIntegers || game.gameCodeIntegers.length === 0) {
            game.gameCodeIntegers = [10, 20, 30];
          }
          game.percentage = parseFloat((Math.random() * 100).toFixed(1));
    
          const shuffledIntegers = game.gameCodeIntegers.map(() => {
            let randomInteger = 0;
            while (randomInteger === 0) {
              randomInteger = Math.floor(Math.random() * 10) * 10;
            }
            return randomInteger;
          });
          game.gameCodeIntegers = shuffle(shuffledIntegers);
    
          // Shuffle timestamps with varying differences between 30 minutes and 3 hours
          game.timestamps.forEach((timestamp: any) => {
            const minDifferenceMs = 30 * 60 * 1000;
            const maxDifferenceMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    
            // Generate a random time difference between 30 minutes and 3 hours
            const randomDifferenceMs = minDifferenceMs + Math.random() * (maxDifferenceMs - minDifferenceMs);
    
            // Calculate the end time based on the random difference
            const randomStartTime = new Date(Math.random() * Date.now() - randomDifferenceMs);
            const randomEndTime = new Date(randomStartTime.getTime() + randomDifferenceMs);
    
            // Format the start and end times
            const formattedStartTime = `${randomStartTime.getHours() < 10 ? '0' : ''}${randomStartTime.getHours()}:${randomStartTime.getMinutes() < 10 ? '0' : ''}${randomStartTime.getMinutes()}`;
            const formattedEndTime = `${randomEndTime.getHours() < 10 ? '0' : ''}${randomEndTime.getHours()}:${randomEndTime.getMinutes() < 10 ? '0' : ''}${randomEndTime.getMinutes()}`;
            
            // Update the timestamp
            timestamp.start = formattedStartTime;
            timestamp.end = formattedEndTime;
          });
    
          await game.save();
        }
    
        return res.json({ message: 'All games shuffled successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }
    };
    


export const UpdateTitle = async (req: Request, res: Response) => {
 try{
  const providerId = req.query.providerId;
  const allGames = await Game.find({ provider: providerId  });
   console.log(allGames)
  if (!allGames || allGames.length === 0) {
    return res.status(404).json({ error: 'No games found for the specified provider' });
  }

  // Update titles for all games by adding '0_' prefix
  for (const game of allGames) {

    // Modify the game's title by adding '0_' prefix
    game.title = game.image.slice(31);

    await game.save(); // Save the updated game document
  }

  return res.json({ message: 'Game titles updated successfully' });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Server error' });
}



}





 