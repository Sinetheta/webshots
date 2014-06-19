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

## NGiNX

S3, by default, sets the Content-Type to `application/octet-stream`, which most
browsers treat as a download-only file. If you wish your screenshots to display
inline instead of automatically downloading, override the Content-Type via an
NGINX reverse-proxy.

```
server {
  listen 80;
  server_name screenshots.example.com

  location / {
    add_header Content-Type image/png;
    proxy_hide_header "Content-Type";
    proxy_pass http://my-bucket-url.s3-region.amazonaws.com/;
  }
}
```

## KeyRemap4Macbook

You can trigger webshots easily via KeyRemap4Macbook. Here's an example
`private.xml` excerpt for doing so:

```xml
<?xml version="1.0"?>
<root>
  <vkopenurldef>
    <name>KeyCode::VK_OPEN_URL_SHELL_webshots</name>
    <url type="shell">
      <![CDATA[ /full/path/to/node /path/to/webshots/capture.js ]]>
    </url>
  </vkopenurldef>

  <item>
    <name>Take screenshot with Right-Command + S</name>
    <identifier>private.right_command_s</identifier>
    <autogen>
      __KeyToKey__
      KeyCode::S, ModifierFlag::COMMAND_R,
      KeyCode::VK_OPEN_URL_SHELL_webshots,
    </autogen>
  </item>
</root>
```
