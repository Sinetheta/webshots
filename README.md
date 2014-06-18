webshots
========

Local Mac screen shot to S3

## Setup

1. Ensure you have an AWS account and have set up an S3 bucket.
2. `npm install` - Install dependencies
3. `cp example.env .env` - Copy the example settings file to your own
4. Edit `.env` and plug in your settings. **Note**: ensure your URL ends with a
   trailing slash!

## AWS Setup

The AWS SDK uses global environment variables for configuration. You'll need
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` set in in the `.env` file to
properly authenticate with AWS.

## Usage

`node capture.js`

This will initiate a the OSX screenshot utility, allowing you to select the area
for the screenshot (as if you pressed CMD+Shift+4). After you select the area,
the resulting PNG will be uploaded to the specified S3 bucket.
