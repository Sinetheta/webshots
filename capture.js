var env = require('node-env-file');
env(__dirname + '/.env');

var fs = require('fs');
var RSVP = require('rsvp');
var shortId = require('shortid');

require('shelljs/global');
config.silent = true;

var promptCapture = function() {
    var screenshot = __dirname + 'capture.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        exec('screencapture -i ' + screenshot, function() {
            resolve(screenshot);
        });
    });

    return promise
}

var AWS = require('aws-sdk');
var uploadImage = function(path) {
    var bucket = process.env.AWS_BUCKET_NAME;
    var filename = shortId.generate().slice(0, 5);
    var promise = new RSVP.Promise(function(resolve, reject){
        fs.readFile(path, function (err, data) {
            if (err) { throw err; }

            var s3 = new AWS.S3();
            s3.client.putObject({
                Bucket: bucket,
                Key: filename + '.png',
                Body: data
            }, function (err, data) {
                var publicUrl = 'http://i.sinetheta.ca/' + filename
                echo(publicUrl);
                resolve(publicUrl);
            });
        });
    });

    return promise;
}

require('copy-paste');
var copyToClipboard = function(publicUrl) {
    var callback = null;
    var supressOutput = true;
    copy(publicUrl, callback, supressOutput);

promptCapture()
.then(uploadImage)
.then(copyToClipboard);
