import { Request, Response } from 'express';
import { User } from '../models/User';
import { IPet, Pet } from '../models/Pet';
import mongoose from 'mongoose';
import { Comment } from '../models/Comment';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

class PetController {

  static async getAllLostPets(req: Request, res: Response) {

    try {
      const lostPets = await Pet.find({ isLost: true }).populate('user', 'name profilePhoto')
      res.status(200).json({ lostPets });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası.' });
    }
  }
  static async getUserLostPets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id
      const userLostPets = await Pet.find({ user: userId, isLost: true })
      res.status(200).json({ userLostPets });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası.' });
    }
  }

  static async getAllAdoptionPets(req: Request, res: Response) {
    try {
      const petsForAdoption = await Pet.find({ isForAdoption: true }).populate('user', 'name profilePhoto');
      res.json({ petsForAdoption });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Sunucu hatası');
    }
  };


  static async getAllBreedingPets(req: Request, res: Response) {
    try {
      const petsForBreedings = await Pet.find({ isForBreeding: true }).populate('user', 'name profilePhoto');
      res.json({ petsForBreedings });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Sunucu hatası');
    }
  };


  static async markAsAdoption(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;
    const { AdoptionDescription, AdoptionLocation } = req.body;

    try {
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı' });
      }

      // Kullanıcının hayvanı mı kontrol et
      if (pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Bu hayvanı Sahiplendirme yetkiniz yok.' });
      }


      pet.isForAdoption = true;
      pet.AdoptionDescription = AdoptionDescription;
      pet.AdoptionLocation = AdoptionLocation;

      await pet.save();
      return res.json({ msg: 'Hayvan sahiplendirilecek olarak işaretlendi', pet });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async getAllPets(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {

      const pets = await Pet.find()
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Pet.countDocuments();

      if (!pets || pets.length === 0) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }


      return res.json({
        pets,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası.' });
    }
  };


  static async getUserPets(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      const pets = await Pet.find({ user: userId });

      return res.json({ pets });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async markAsLost(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;
    const { lostDescription, lostLocation } = req.body;

    try {
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı' });
      }


      if (pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Bu hayvanı kayboldu olarak işaretleme yetkiniz yok.' });
      }


      pet.isLost = true;
      pet.lostDescription = lostDescription;
      pet.lostLocation = lostLocation;

      await pet.save();
      return res.json({ msg: 'Hayvan kayboldu olarak işaretlendi', pet });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async addPet(req: AuthRequest, res: Response): Promise<Response> {
    const {
      name,
      species,
      age,
      breed,
      gender,
      size,
      weight,
      isNeutered,
      personalityTraits,
      vaccinationStatus,
      vaccinationDescription,
      healthStatus,
      microchipInfo,
      vetInfo,
      isForAdoption,
      isForBreeding,
      isLost,
    } = req.body;


    if (!name || !req.file || !species || !breed || !age || !gender || !size || !isNeutered) {
      return res.status(400).json({ msg: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı.' });
      }


      const newPet = new Pet({
        user: user._id,
        name,
        species,
        age,
        breed,
        gender,
        size,
        weight,
        isNeutered,
        personalityTraits,
        vaccinationStatus,
        vaccinationDescription,
        healthStatus,
        microchipInfo,
        vetInfo,
        isForAdoption: isForAdoption || false,
        isForBreeding: isForBreeding || false,
        isLost,
        photos: `/uploads/pet/${req.file.filename}`,
      });


      const savedPet = await newPet.save();


      user.pets.push(savedPet._id as mongoose.Types.ObjectId);
      await user.save();

      return res.json({ msg: 'Hayvan başarıyla eklendi', pet: savedPet });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async updatePet(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;
    const {
      name,
      species,
      gender,
      breed,
      age,
      size,
      weight,
      personalityTraits,
      vaccinationStatus,
      vaccinationDescription,
      healthStatus,
      microchipInfo,
      vetInfo,
      isLost,
      isForAdoption,
      isForBreeding,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ msg: 'Geçersiz hayvan ID' });
    }

    try {
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı' });
      }

      if (pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Bu hayvanı güncelleme yetkiniz yok.' });
      }

      const updateFields: Partial<IPet> = {
        name,
        species,
        gender,
        breed,
        age,
        size,
        weight,
        personalityTraits,
        vaccinationStatus,
        vaccinationDescription,
        healthStatus,
        microchipInfo,
        vetInfo,
        isLost,
        isForAdoption: isForAdoption === "Evet",
        isForBreeding: isForBreeding === "Evet",
      };

      Object.keys(updateFields).forEach((key) => {
        if ((updateFields as any)[key] !== undefined) {
          (pet as any)[key] = (updateFields as any)[key];
        }
      });

      if (req.file) {
        const newPhotoPath = `/uploads/pet/${req.file.filename}`;

        // Eski fotoğrafı sil (eğer varsa)
        if (pet.photos && pet.photos.length > 0) {
          const oldPhotoPath = path.join(__dirname, '..', '..', pet.photos[0]); // İlk fotoğrafı hedefliyoruz
          fs.unlink(oldPhotoPath, (err) => {
            if (err) {
              console.error('Eski fotoğraf silinemedi:', err.message);
            } else {
              console.log('Eski fotoğraf başarıyla silindi:', oldPhotoPath);
            }
          });

          // Eski fotoğrafı diziden kaldır
          pet.photos.shift();
        }

        // Yeni fotoğrafı diziye ekle
        if (Array.isArray(pet.photos)) {
          pet.photos.push(newPhotoPath);
        } else {
          pet.photos = [newPhotoPath]; // Eğer `photos` tanımlı değilse, yeni bir dizi oluştur
        }
      }

      await pet.save();

      return res.json({
        msg: 'Hayvan bilgileri başarıyla güncellendi',
        updatedFields: Object.keys(updateFields).filter((key) => (updateFields as any)[key] !== undefined),
        pet
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  }


  static async deletePet(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;

    try {

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }


      if (pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Bu hayvanı silme yetkiniz yok.' });
      }


      await Comment.deleteMany({ pet: pet._id });


      await Pet.findByIdAndDelete(petId);

      return res.json({ msg: 'Hayvan başarıyla silindi.' });
    } catch (err: any) {
      console.error('Silme işlemi sırasında hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async addComment(req: AuthRequest, res: Response) {
    const { petId } = req.params;
    const { text } = req.body;


    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
    }

    try {

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Hayvan bulunamadı.' });
      }


      const comment = new Comment({
        user: req.user?.id,
        text,
        pet: pet._id,
      });


      await comment.save();


      pet.comments.push(comment._id as mongoose.Schema.Types.ObjectId);


      await pet.save();

      return res.status(201).json({ msg: 'Yorum başarıyla eklendi.', comment });
    } catch (err: any) {
      console.error('Yorum eklenirken hata oluştu:', err.message);
      return res.status(500).json({ message: 'Sunucu hatası.' });
    }
  };


  static async deleteComment(req: AuthRequest, res: Response): Promise<Response> {
    const { commentId } = req.params;

    try {

      const comment = await Comment.findById(commentId).populate('pet');
      if (!comment) {
        return res.status(404).json({ msg: 'Yorum bulunamadı.' });
      }


      const pet = await Pet.findById(comment.pet);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }


      if (comment.user.toString() !== req.user?.id && pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Yorumu silme yetkiniz yok.' });
      }


      await Comment.findByIdAndDelete(commentId);

      return res.json({ msg: 'Yorum başarıyla silindi.' });
    } catch (err: any) {
      console.error('Yorum silme işlemi sırasında hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async viewPet(req: AuthRequest, res: Response) {
    const { petId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Kullanıcı doğrulanmadı.' });
    }

    const userIdObject = new mongoose.Types.ObjectId(req.user.id);

    try {

      const pet = await Pet.findById(petId);

      if (!pet) {
        return res.status(404).json({ message: 'Hayvan bulunamadı.' });
      }


      const owner = await User.findById(pet.user);

      if (!owner) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }


      const isBlocked = owner.blockedUsers.some((blockedUser: mongoose.Types.ObjectId) => {
        return blockedUser.toString() === userIdObject.toString();
      });

      if (isBlocked) {
        return res.status(403).json({ message: 'Bu kullanıcının hayvanlarını göremezsiniz.' });
      }

      return res.status(200).json(pet);

    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ error: err.message || 'Sunucu hatası.' });
    }
  };

}

export default PetController