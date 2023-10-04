import express, { Request, Response } from 'express';
import {NewProvider, GetAllProvider,GetSingleProvider,UpdateProvider,DeleteProvider} from '../controller/ProviderController';
import upload from '../middleware/multer';
const router = express.Router();

// Create a new game provider
router.post('/',upload.single('image'),NewProvider );

// Get all game providers
router.get('/', GetAllProvider);

// Get a single game provider by ID
router.get('/:id', GetSingleProvider);

// Update a game provider by ID
router.put('/:id',upload.single('image'), UpdateProvider);

// Delete a game provider by ID
router.delete('/:id',DeleteProvider );

export default router;
