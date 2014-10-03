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

var shortId = require('shortid');
var getShortName = function() {
    return shortId.generate().slice(0, 5);
};
var promptCapture = function(name) {
    var isMac = /darwin/.test(process.platform);
    var uploadName = name? encodeURIComponent(name): getShortName();
    var screenshot = __dirname + '/capture.png';
    var promise = new RSVP.Promise(function(resolve, reject){
        var screenshotCommand;
        if (isMac) {
            screenshotCommand = 'screencapture -i ' + screenshot;
        } else {
            screenshotCommand = 'scrot -s ' + screenshot;
        }
        exec(screenshotCommand, function() {
            resolve({path: screenshot, uploadName: uploadName});
        });
    });

    return promise;
};

var reduceImage = function(options) {
    var fileName = options.fileName;
    var path = options.path;
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
            resolve({path: screenshot, uploadName: uploadName});
        });
    });

    return promise;
};

var AWS = require('aws-sdk');
var fs = require('fs');
var uploadImage = function(options) {
    var uploadName = options.uploadName;
    var path = options.path;
    AWS.config.update({region: process.env.AWS_REGION});
    var bucket = process.env.AWS_BUCKET_NAME;
    var linkPrefix = process.env.LINK_PREFIX;
    var filename = shortId.generate().slice(0, 5);
    var promise = new RSVP.Promise(function(resolve, reject) {
        fs.readFile(path, function (err, data) {
            if (err) { throw err; }

            var s3 = new AWS.S3();
            s3.putObject({
                Bucket: bucket,
                Key: uploadName + '.png',
                Body: data
            }, function (err, data) {
                if (err) { throw err; }
                var publicUrl = linkPrefix + uploadName + '.png'
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
var name = argv.name || argv.n;
var uploadName = typeof name === 'string'? name: undefined;

promptCapture(uploadName)
.then(argv.retina? reduceImage: dummypromise)
.then(uploadImage)
.then(copyToClipboard);
