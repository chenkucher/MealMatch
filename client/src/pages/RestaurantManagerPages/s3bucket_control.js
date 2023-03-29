const AWS = require('aws-sdk');

//AWS credentials and region
AWS.config.update({
  accessKeyId: 'AKIAUG4QYSABXV4Y5HN5',
  secretAccessKey: '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',
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const s3Bucket = 'mealmatch'; //S3 bucket name

async function listObjects(imageName) {
  const params = { Bucket: s3Bucket, Prefix: imageName ,Expires: 7200 };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map((item) => ({
      key: item.Key,
      url: `https://${s3Bucket}.s3.amazonaws.com/${encodeURIComponent(item.Key)}`,
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
    ACL: 'public-read',
    Expires: 7200,
  };

  console.log('fileContent:', fileContent);
  console.log('params:', params);

  try {
    const { Location } = await s3.upload(params).promise();
    console.log('File uploaded successfully:', Location);
    return Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function deleteFileFromS3(fileKey) {
  const params = { Bucket: s3Bucket, Key: fileKey };

  try {
    const data = await s3.deleteObject(params).promise();
    console.log('File deleted successfully:', fileKey);
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

function getImageUrl(fileKey) {
  const params = { Bucket: s3Bucket, Key: fileKey };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        // console.log('Pre-signed URL:', url);
        resolve(url);
      }
    });
  });
}

module.exports = { listObjects, uploadFileToS3, deleteFileFromS3, getImageUrl };