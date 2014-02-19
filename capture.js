var env = require('node-env-file');
env(__dirname + '/.env');

var fs = require('fs');
var moment = require('moment');
var RSVP = require('rsvp');

require('shelljs/global');

var promptCapture = function() {
    var screenshot = __dirname + 'capture.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        exec('screencapture -i ' + screenshot, function() {
            echo('Screenshot captured ' + screenshot);
            resolve(screenshot);
        });
    });

    return promise
}

var AWS = require('aws-sdk');
var uploadImage = function(path) {
    var timestamp = '2014-01-20 at 2.44.03 AM';
    var bucket = process.env.AWS_BUCKET_NAME;
    var filename = 'ScreenShot-' + moment().toISOString() + '.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        fs.readFile(path, function (err, data) {
            if (err) { throw err; }

            var s3 = new AWS.S3();
            s3.client.putObject({
                Bucket: bucket,
                Key: filename,
                Body: data
            }, function (err, data) {
                var publicUrl = s3.endpoint.href + bucket + '/' + filename;
                echo('Image uploaded successfully to ' + publicUrl);
                resolve(publicUrl);
            });
        });
    });

    return promise;
}

require('copy-paste');
var copyToClipboard = function(publicUrl) {
    copy(publicUrl);
    echo('Url copied to Clipboard!');
}

promptCapture()
.then(uploadImage)
.then(copyToClipboard);
