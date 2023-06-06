const AWS = require('aws-sdk');

// AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const s3Bucket ='mealmatch'; // S3 bucket name

async function listObjects(imageName) {
  const params = { Bucket: s3Bucket, Prefix: imageName };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map((item) => ({
      key: item.Key,
      url: s3.getSignedUrl('getObject', { Bucket: s3Bucket, Key: item.Key, Expires: 7200 }),
    }));
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

async function uploadFileToS3(fileName, fileContent) {
  const params = {
    Bucket: s3Bucket,
    Key: fileName,
    Body: fileContent,
    ContentType: 'image/png',
    ContentDisposition: 'inline',
    ACL: 'public-read'
  };

  try {
    const { Location } = await s3.upload(params).promise();
    console.log('File uploaded successfully:', Location);
    console.log(Location);
    return Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function deleteFileFromS3(fileKey) {
  const params = { Bucket: s3Bucket, Key: fileKey };
    
  try {
    await s3.deleteObject(params).promise();
    // console.log('File deleted successfully:', fileKey);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

function getImageUrl(fileKey) {
  const params = { Bucket: s3Bucket, Key: fileKey, Expires: 7200 };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}

module.exports = { listObjects, uploadFileToS3, deleteFileFromS3, getImageUrl };
