# cloud-feature-toggles

Simple implementation of feature toggles that are powered by cloud services.

### Features

This module encapsulates all calls to check if a certain feature toggle is enabled.
Furthermore, developers can choose a specific cloud service that hosts the feature toggles. Currently the following cloud services are supported:
* AWS
	* [S3](https://aws.amazon.com/s3/)
	* [DynamoDB](https://aws.amazon.com/dynamodb/) [**COMING SOON**]
* Azure [**COMING SOON**]
	* [Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) [**COMING SOON**]

### Options
Object to be passed into module instantiation:
* `aws` - contains all configurations of cloud services under AWS
	* `region` - AWS region (e.g. ap-southeast-1)
	* `s3` - use this if you want to use AWS S3 to host your feature toggles
		* `bucket` - name of S3 bucket that hosts your feature toggles

### Feature toggle representation
JSON format that represents the feature toggle:
```
{
	"isEnabled": true
}
```

### Usage

```javascript
// instantiate module with options object
const cloudFeatureToggles = require('cloud-feature-toggles')({
  aws: {
		region: '<REGION>', // e.g. ap-southeast-1
		s3: {
			bucket: '<FEATURE_TOGGLES_BUCKET>'  // e.g. my-feature-toggles
		}
	}
});
  
const main = async() => {
	// use isEnabled method to check if MY_FEATURE_TOGGLE is enabled
	// note the await keyword
	if (await cloudFeatureToggles.isEnabled('MY_FEATURE_TOGGLE')) {
		// continue with MY_FEATURE flow
	} else {
		// continue with normal flow
	}
}

main();
```

### Notes
* This module primarily uses [aws-sdk](https://github.com/aws/aws-sdk-js) to connect to S3
* Hence, if this is used in AWS environment (i.e. Lambda or EC2), do make sure that an IAM role with the appropriate policies is attached (i.e. S3 read access)
* If your application is in a non-AWS environment (e.g. Azure), it might be better to utilise [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) to host your feature toggles
	* Support for this feature will be **COMING SOON**