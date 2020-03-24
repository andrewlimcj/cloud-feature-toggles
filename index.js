const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const CONSOLE_LOG_PREFIX = '[cloud-feature-toggles]'

module.exports = (options) => {
  init(options);

  isEnabled = async (featureToggle) => {
    if (options.aws.s3) {
      try {
        const featureToggleConfig = await getObjectS3(options.aws.s3.bucket, featureToggle);

        return featureToggleConfig.isEnabled;
      } catch (err) {
        console.warn(`${CONSOLE_LOG_PREFIX} Error in retrieving config from AWS S3 - ` + err);
        console.warn(`${CONSOLE_LOG_PREFIX} Default to return false`);

        return false;
      }
    }

    return false;
  };

  return {
    isEnabled
  };
}

const init = (options) => {
  if (typeof options === 'undefined' || options === null) {
    throw new Error('Missing options parameter');
  }

  if (!Object.keys(options).length) {
    throw new Error('Missing configuration in options parameter');
  }

  if (options.aws) {
    if (!options.aws.region || options.aws.region === null) {
      throw new Error('Missing region in AWS configuration');
    }

    AWS.config.update({ region: options.aws.region });
  }
}

const getObjectS3 = (bucket, key) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Key: key
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        reject(new Error(err.message));
      } else {
        resolve(JSON.parse(data.Body.toString('utf-8')));
      }
    });
  });
}