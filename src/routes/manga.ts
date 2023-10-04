import express, { Request, Response } from 'express';
import { check } from 'express-validator';
import authenticate from '../middleware/authenticate';
import {mangaUpload,searchManga} from '../controller/MangaController';
import Upload from '../middleware/multer';

const router = express.Router();


router.post('/upload',authenticate, Upload , mangaUpload);


// router.get('/Users/:id', mangaGet);


router.get('/search-manga', searchManga)
  
   
  
 
  
 
  
  
  
  
  
  

export default router;
