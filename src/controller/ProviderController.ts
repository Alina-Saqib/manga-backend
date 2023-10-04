import express, { Request, Response, Router } from 'express';
import GameProvider from '../model/gameProvider'; 
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



export const NewProvider= async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
          }
          const imageURL = await uploadImageToFTP(req.file);
       console.log(imageURL);
        const gameProvider = new GameProvider({ name, image: imageURL});
        const savedGameProvider = await gameProvider.save();
        res.json(savedGameProvider);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Could not create game provider' });
      }
   
    }

    function uploadImageToFTP(file: Express.Multer.File | undefined): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        if (!file) {
          reject(new Error('No Image provided'));
          return;
        }
    
        let ftpImagePath = '';
    
        ftp.connect(ftpConfig)
          .then(() => {
            return ftp.cwd('/public_html/Providers Logo/');
          })
          .then(() => {
            // Use a unique file name or modify as needed
            ftpImagePath = `ProviderImage_${file.originalname}`;
            return ftp.put(file.buffer, ftpImagePath);
          })
          .then(() => {
            ftp.end();
            resolve(`/Providers Logo/${ftpImagePath}`);
          })
          .catch((err) => {
            ftp.end();
            reject(err);
          });
      });
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

    export const UpdateProvider = async (req: Request, res: Response) => {
      try {
        const { name } = req.body;
        let imageURL = '';
    
        if (req.file) {
          imageURL = await uploadImageToFTP(req.file);
        }
    
        const updatedGameProvider = await GameProvider.findByIdAndUpdate(
          req.params.id,
          { name, ...(imageURL && { image: imageURL }) }, 
          { new: true }
        );
    
        if (!updatedGameProvider) {
          return res.status(404).json({ error: 'Game provider not found' });
        }
    
        res.json(updatedGameProvider);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update game provider' });
      }
    };
    

   export const DeleteProvider= async (req: Request, res: Response) => {
        try {
    const deletedGame = await GameProvider.findById(req.params.id);
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
            const deletedGameProvider = await GameProvider.findByIdAndRemove(req.params.id);
            if (!deletedGameProvider) {
              return res.status(404).json({ error: 'Game provider not found' });
            }
            res.json(deletedGameProvider);
          } catch (error) {
            res.status(500).json({ error: 'Could not delete game provider' });
          }
   
    }



 