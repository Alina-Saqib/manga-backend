import express, { Request, Response, Router } from 'express';
import GameProvider from '../model/gameProvider'; 



export const NewProvider= async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
          }
       
        const gameProvider = new GameProvider({ name, image: req.file.buffer.toString('base64')});
        const savedGameProvider = await gameProvider.save();
        res.json(savedGameProvider);
      } catch (error) {
        res.status(500).json({ error: 'Could not create game provider' });
      }
   
    }

    export const GetAllProvider= async (req: Request, res: Response) => {
    try {
        const gameProviders = await GameProvider.find();
        res.json(gameProviders);
       
      } catch (error) {
        res.status(500).json({ error: 'Could not fetch game providers' });
      }
   
    }

    export  const GetSingleProvider= async (req: Request, res: Response) => {
        try {
            const gameProvider = await GameProvider.findById(req.params.id);
            if (!gameProvider) {
              return res.status(404).json({ error: 'Game provider not found' });
            }
            res.json(gameProvider);
          } catch (error) {
            res.status(500).json({ error: 'Could not fetch game provider' });
          }
   
    }

    export  const UpdateProvider= async (req: Request, res: Response) => {
        try {
            const { name, image } = req.body;
            const updatedGameProvider = await GameProvider.findByIdAndUpdate(
              req.params.id,
              { name, image },
              { new: true }
            );
            if (!updatedGameProvider) {
              return res.status(404).json({ error: 'Game provider not found' });
            }
            res.json(updatedGameProvider);
          } catch (error) {
            res.status(500).json({ error: 'Could not update game provider' });
          }
       
   
    }

   export const DeleteProvider= async (req: Request, res: Response) => {
        try {
            const deletedGameProvider = await GameProvider.findByIdAndRemove(req.params.id);
            if (!deletedGameProvider) {
              return res.status(404).json({ error: 'Game provider not found' });
            }
            res.json(deletedGameProvider);
          } catch (error) {
            res.status(500).json({ error: 'Could not delete game provider' });
          }
   
    }



 