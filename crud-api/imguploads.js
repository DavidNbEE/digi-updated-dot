const { Storage } = require('@google-cloud/storage');
const moment = require('moment');
const path = require('path');

const serviceAccountKeyPath = path.resolve('./serviceaccountkey.json');

// Konfigurasi Google Cloud Storage
const storage = new Storage({
  projectId: 'testing-diginote-2023',
  keyFilename: serviceAccountKeyPath
});

// Sesuaikan nama bucketnya
const bucketName = 'url-photos-diginotes';
const bucket = storage.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const ImgUpload = {};

ImgUpload.uploadToGcs = (imageData) => {
  return new Promise((resolve, reject) => {
    if (!imageData) {
      reject('No image data provided');
      return;
    }

    const gcsname = moment().format('YYYYMMDD-HHmmss');
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg' // Ubah tipe konten sesuai dengan format gambar yang dikirimkan
      }
    });

    stream.on('error', (err) => {
      console.error('Error uploading image:', err);
      reject(err);
    });

    stream.on('finish', () => {
      const publicUrl = getPublicUrl(gcsname);
      console.log('Image uploaded successfully.');
      console.log('Public URL:', publicUrl);
      resolve(publicUrl);
    });

    stream.end(imageData);
  });
};

module.exports = ImgUpload;
