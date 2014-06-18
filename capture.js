var env = require('node-env-file');
env(__dirname + '/.env');

var RSVP = require('rsvp');
var dummypromise = function(input) {
    var promise = new RSVP.Promise(function(resolve, reject){
        resolve(input);
    });

    return promise;
};

require('shelljs/global');
config.silent = true;
var measureImage = function(path, dimension) {
    var screenshot = __dirname + '/capture.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        exec('sips ' + path + ' -g ' + dimension, function(command, output) {
            var dim = output.match(/\d+/);
            dim = parseInt(dim, 10);
            resolve(dim);
        });
    });

    return promise;
};

var resizeImage = function(path, restrictTo) {
    var promise = new RSVP.Promise(function(resolve, reject){
        exec('sips ' + path + ' -Z ' + restrictTo, function() {
            resolve(path);
        });
    });

    return promise;
};

var promptCapture = function() {
    var screenshot = __dirname + '/capture.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        exec('screencapture -i ' + screenshot, function() {
            resolve(screenshot);
        });
    });

    return promise;
};

var reduceImage = function(path) {
    var promise = new RSVP.Promise(function(resolve, reject){
        RSVP.all([
            measureImage(path, 'pixelHeight'),
            measureImage(path, 'pixelWidth')
        ]).then(function(args) {
            var height = args[0];
            var width = args[1];
            var newLargestDim = Math.max(height, width)/2;

            return resizeImage(path, newLargestDim);
        }).then(function() {
            resolve(path);
        });
    });

    return promise;
};

var AWS = require('aws-sdk');
var fs = require('fs');
var shortId = require('shortid');
var uploadImage = function(path) {
    AWS.config.update({region: process.env.AWS_REGION});
    var bucket = process.env.AWS_BUCKET_NAME;
    var linkPrefix = process.env.LINK_PREFIX;
    var filename = shortId.generate().slice(0, 5);
    var promise = new RSVP.Promise(function(resolve, reject) {
        fs.readFile(path, function (err, data) {
            if (err) { throw err; }

            var s3 = new AWS.S3();
            s3.client.putObject({
                Bucket: bucket,
                Key: filename + '.png',
                Body: data
            }, function (err, data) {
                var publicUrl = linkPrefix + filename
                echo(publicUrl);
                resolve(publicUrl);
            });
        });
    });

    return promise;
};

require('copy-paste').silent();
var copyToClipboard = function(publicUrl) {
    copy(publicUrl);
};

var argv = require('minimist')(process.argv.slice(2));

promptCapture()
.then(argv.retina? reduceImage: dummypromise)
.then(uploadImage)
.then(copyToClipboard);
