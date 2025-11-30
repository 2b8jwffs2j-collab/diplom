import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Uploads folder үүсгэх (байхгүй бол)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

// File filter - зөвхөн зураг файлууд
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Зөвхөн зураг файл (JPEG, PNG, GIF, WebP) оруулах боломжтой!'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

// Upload middleware (multiple files)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadMultiple: any = upload.array('images', 10); // Max 10 files

// Upload middleware (single file)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadSingle: any = upload.single('image');
