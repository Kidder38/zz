const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/photos',
    './uploads/datasheets',
    './uploads/manuals',
    './uploads/services'  // Adresář pro soubory servisních výjezdů
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create upload directories on startup
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './uploads';
    
    // Zjištění původu požadavku (zda jde o nahrávání k servisnímu výjezdu)
    const isServiceFile = req.originalUrl && req.originalUrl.includes('/service/');
    
    if (isServiceFile) {
      // Soubory servisních výjezdů jdou do adresáře services
      uploadPath = './uploads/services';
    } else {
      // Standardní logika pro soubory zařízení
      const fileType = req.body.file_type || 'other';
      
      if (fileType === 'photo') {
        uploadPath = './uploads/photos';
      } else if (fileType === 'datasheet') {
        uploadPath = './uploads/datasheets';
      } else if (fileType === 'manual') {
        uploadPath = './uploads/manuals';
      }
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Zjištění původu požadavku (zda jde o nahrávání k servisnímu výjezdu)
  const isServiceFile = req.originalUrl && req.originalUrl.includes('/service/');
  
  if (isServiceFile) {
    // Pro servisní výjezdy povolujeme pouze obrázky
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Nepodporovaný typ souboru. Pro servisní výjezdy jsou povoleny pouze obrázky (JPG, PNG, GIF, WebP).`), false);
    }
  } else {
    // Standardní logika pro soubory zařízení
    const fileType = req.body.file_type || 'other';
    
    // Set allowed MIME types based on file type
    let allowedTypes = [];
    
    if (fileType === 'photo') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else if (fileType === 'datasheet' || fileType === 'manual') {
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    } else {
      // For other file types, allow common file formats
      allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
    }
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Nepodporovaný typ souboru. Povolené typy: ${allowedTypes.join(', ')}`), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

module.exports = upload;