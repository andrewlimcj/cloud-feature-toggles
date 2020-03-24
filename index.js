const AWS = require('aws-sdk');
let s3, documentClient;

const CONSOLE_LOG_PREFIX = '[cloud-feature-toggles]';
const CONSOLE_LOG_S3_PREFIX = '[S3]';
const CONSOLE_LOG_DYNAMODB_PREFIX = '[DynamoDB]';

module.exports = (options) => {
  init(options);

  isEnabled = async (featureToggle) => {
    // default
    let featureToggleConfig = {
      isEnabled: false
    };

    try {
      if (options.aws.s3) {
        featureToggleConfig = await getS3Object(options.aws.s3.bucket, featureToggle);
      } else if (options.aws.dynamoDB) {
        featureToggleConfig = await getDynamoDBItem(options.aws.dynamoDB.tableName, featureToggle);
      }
    } catch (err) {
      console.warn(`${CONSOLE_LOG_PREFIX} Error in retrieving config: ` + err);
      console.warn(`${CONSOLE_LOG_PREFIX} Default to return false`);

      return false;
    }

    return featureToggleConfig.isEnabled;
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
      throw new Error('Missing region parameter in AWS configuration');
    }

    AWS.config.update({ region: options.aws.region });

    if (options.aws.s3) {
      if (!options.aws.s3.bucket || options.aws.s3.bucket === null) {
        throw new Error('Missing bucket parameter in S3 configuration');
      }

      s3 = new AWS.S3();
    } else if (options.aws.dynamoDB) {
      if (!options.aws.dynamoDB.tableName || options.aws.dynamoDB.tableName === null) {
        throw new Error('Missing tableName parameter in dynamoDB configuration');
      }

      documentClient = new AWS.DynamoDB.DocumentClient();
    }
  }
}

const getS3Object = (bucket, key) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Key: key
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        reject(`${CONSOLE_LOG_S3_PREFIX} ${err.message}`);
      } else {
        resolve(JSON.parse(data.Body.toString('utf-8')));
      }
    });
  });
}

const getDynamoDBItem = (tableName, id) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        id
      }
    };

    documentClient.get(params, (err, data) => {
      if (err) {
        reject(`${CONSOLE_LOG_DYNAMODB_PREFIX} ${err.message}`);
      } else {
        if (!data.Item) {
          reject(`${CONSOLE_LOG_DYNAMODB_PREFIX} Item not found`);
        }

        resolve(data.Item);
      }
    });
  });
}