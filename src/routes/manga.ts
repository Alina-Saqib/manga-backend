import express, { Request, Response } from 'express';
import authenticate from '../middleware/authenticate';
import {getAllManga, mangaDelete, mangaGet, mangaUpload,searchManga} from '../controller/MangaController';
import Upload from '../middleware/multer';

const router = express.Router();


router.post('/upload',authenticate, Upload , mangaUpload);

router.get('/', getAllManga);

router.get('/Users/:id', mangaGet);


router.get('/search-manga', searchManga)

router.delete('/:id', mangaDelete)
  
   
  
 
  
 
  
  
  
  
  
  

export default router;
