import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece JPEG, PNG, WEBP, JPG  dosyaları yüklenebilir.'));
        }
    },
});


const petStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/pet/'); // Dosyanın kaydedileceği dizin
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});



export const petImageUpload = multer({
    storage: petStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum dosya boyutu: 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece JPEG, PNG, WEBP, JPG  dosyaları yüklenebilir.'));
        }
    }
});


