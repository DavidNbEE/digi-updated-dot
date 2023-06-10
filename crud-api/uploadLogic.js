const { Storage } = require('@google-cloud/storage');
const path = require('path')
const keyFilePath = 'D:/diginote-backend-superb/crud-api/keypathfile.json';

const storage = new Storage({
  projectId: 'testing-diginote-2023', // Ganti dengan ID proyek Google Cloud Storage Anda
  keyFilename: keyFilePath
});

const bucketName = 'url-photos-diginotes'; // Ganti dengan nama bucket Anda

const uploadImage = async (file) => {
  const bucket = storage.bucket(bucketName);

  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', () => {
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(imageUrl);
    });

    stream.end(file.buffer);
  });
};

module.exports = uploadImage;
