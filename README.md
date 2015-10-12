# GPII Website Connector (Chrome extension)

## Description

This (experimental) extension allows to any trusted site to receive settings from the GPII personalization framework.

## Installation

Download the source code to a folder on your computer. You can either clone this repository or download a snapshot of master in a zip file.

In Google Chrome, go to 'Extensions', make sure that the 'Developer mode' checkbox is on, then click on 'Load unpacked extensions'. In the dialog box, select the folder where you downloaded the extension.

## How to make use of gwc-chrome in a website?

### Integrate your solution

First, your website needs to be integrated with the GPII. [More info](http://blogs.cloud4all.info/developers/information-about-your-solution/)

### Add your site to GWC for Chrome

The extension will only accept petitions from trusted sites, for this you need to include your domain name into the extension's [manifest.json](https://github.com/javihernandez/gwc-chrome/blob/master/manifest.json#L15).

```
"matches": ["*://*.example.com/*"]
```

Don't forget to reload the extension after applying this change.

### Connect your site with the extension

Put this chunk of code somewhere in the source code of your site.

```
<script>
    var extensionId = "igaanphginiejaklcmocedefjghhodoi";
    var solutionId = "my.example.com";

    var port = chrome.runtime.connect(extensionId);
    port.postMessage({type: "connectionRequest", solutionId: solutionId});
    port.onMessage.addListener(function (msg) {
        // At this point, the extension has accepted your connection request
        if (msg.accepted) {
            console.log("## got an okay from the extension side, now let's wait for settings ...");
        }
        // Whenever your settings change, you will be notified
        if (msg.settings) {
            console.log("## got new settings: " + JSON.stringify(msg.settings));
        }
    });
</script>
```

This may change in the future, so stay tuned ...

## Contributing

Any question? Found a bug? File an [issue](https://github.com/javihernandez/gwc-chrome/issues).

Do you want to contribute with source code?

1. Fork the repository on Github
2. Create a named feature branch (like `add_component_x`)
3. Write your change
4. Submit a pull request using Github
