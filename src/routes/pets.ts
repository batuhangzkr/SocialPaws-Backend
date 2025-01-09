import express from 'express';
import PetController from '../controllers/petController';
import { auth } from '../middleware/auth';
import { petImageUpload } from '../middleware/multer';

const router = express.Router();


router.get('/', auth, PetController.getUserPets);
router.delete('/delete/:petId', auth, PetController.deletePet);
router.put('/markAsLost/:petId', auth, PetController.markAsLost);
router.get('/getAllLostPets', auth, PetController.getAllLostPets)
router.get('/getUserLostPets', auth, PetController.getUserLostPets)
router.get('/getAllAdoptionPets', PetController.getAllAdoptionPets)
router.get('/getAllBreedingPets', auth, PetController.getAllBreedingPets)
router.put('/markAsAdoption/:petId', auth, PetController.markAsAdoption);
router.post('/addPet', auth, petImageUpload.single('photo'), PetController.addPet);
router.put('/update/:petId', auth, petImageUpload.single('photo'), PetController.updatePet);
router.post('/:petId/comment', auth, PetController.addComment);
router.delete('/comments/:commentId', auth, PetController.deleteComment);

export default router;
