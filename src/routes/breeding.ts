import express from 'express';
import BreedingController from '../controllers/breedingController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.post('/request', auth, BreedingController.sendBreedingRequest);


router.put('/accept', auth, BreedingController.acceptBreedingRequest);

export default router;