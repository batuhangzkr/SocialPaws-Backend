import { Request, Response } from 'express';
import { BreedingRequest } from '../models/BreedingRequest';
import { Pet } from '../models/Pet';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { Conversation } from '../models/Conversation';

class BreedingController {

  static async sendBreedingRequest(req: AuthRequest, res: Response) {
    const { requesterPetId, recipientPetId } = req.body;

    if (!req.user) {
      return res.status(401).json({ msg: 'Yetkisiz işlem, kullanıcı doğrulanamadı.' });
    }

    try {
      const requesterPet = await Pet.findById(requesterPetId);
      const recipientPet = await Pet.findById(recipientPetId);

      if (requesterPet?.isLost || requesterPet?.isNeutered) {
        return res.status(400).json({ msg: 'Kayıp ya da kısırlaştırılmış hayvanlar çiftleştirilemez.' });
      }

      if (recipientPet?.isLost || recipientPet?.isNeutered) {
        return res.status(400).json({ msg: 'Kayıp ya da kısırlaştırılmış hayvanlar ile çiftleşme yapılamaz.' });
      }


      const lastRequest = await BreedingRequest.findOne({
        requester: req.user.id,
        requesterPet: requesterPetId,
        recipientPet: recipientPetId,
        createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      });

      if (lastRequest) {
        return res.status(400).json({ msg: 'Bu hayvandan bu hayvana 6 saat içinde yalnızca 1 istekte bulunabilirsiniz.' });
      }

      const breedingRequest = new BreedingRequest({
        requester: req.user.id,
        requesterPet: requesterPetId,
        recipient: recipientPet?.user,
        recipientPet: recipientPetId,
      });

      await breedingRequest.save();

      return res.status(201).json(breedingRequest);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  };


  static async acceptBreedingRequest(req: Request, res: Response) {
    const { requestId } = req.body;

    try {
      const request = await BreedingRequest.findById(requestId);

      if (!request || request.status !== 'Pending') {
        return res.status(400).json({ msg: 'Geçersiz istek' });
      }


      request.status = 'Accepted';
      await request.save();


      const requesterPet = await Pet.findById(request.requesterPet);
      const recipientPet = await Pet.findById(request.recipientPet);


      const participantIds = [request.requester.toString(), request.recipient.toString()];
      const contextType = 'breeding';

      const existingConversation = await Conversation.findOne({
        participants: { $all: participantIds },
        contextType: contextType,
      });

      if (!existingConversation) {
        const newConversation = new Conversation({
          participants: participantIds,
          contextType: contextType,
        });

        await newConversation.save();
      }


      const contentToRequester = `Çiftleşme isteğiniz kabul edildi: ${recipientPet?.name}`;
      await Notification.create({
        user: request.requester,
        type: 'breeding',
        content: contentToRequester
      });


      const contentToRecipient = `Yeni bir çiftleşme isteği aldınız: ${requesterPet?.name}`;
      await Notification.create({
        user: request.recipient,
        type: 'breeding',
        content: contentToRecipient
      });

      return res.json({ msg: 'Eşleşme kabul edildi, mesajlaşma başlatıldı' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  };

}

export default BreedingController
