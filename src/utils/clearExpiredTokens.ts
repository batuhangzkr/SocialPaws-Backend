import { Token } from '../models/Token';

export const clearExpiredTokens = async (): Promise<void> => {
    try {
        const now = new Date();
        await Token.deleteMany({ expiryDate: { $lt: now } });
        console.log("Süresi dolan tokenlar temizlendi");
    } catch (err) {
        console.error('Token temizlenirken hata oluştu', err);
    }
}