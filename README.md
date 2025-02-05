# Podman Desktop Extension Minimal Template

<p align="center">
  <img alt="Hello World" src="/images/helloselkie.png" width="50%">
</p>

## Overview

This template provides a minimal template on how to build a Podman Desktop extension. More information can be found on our [official extension documentation](https://podman-desktop.io/docs/extensions) on how to further expand your extension.

With this template, on activating a "Hello World!" dialog will appear.

## Development

To build and develop the extension, follow these steps:

1. Clone the project or your fork:
```sh
$ git clone https://github.com/containers/podman-desktop-extension-minimal-template/
```

2. Run `npm install` to install all relevant packages:
```sh
$ npm install
```

3. Create a build:

Creating a build will generate all required files for Podman Desktop to load the extension:

```sh
$ npm run build
```
Optionally, you can also use `npm run watch` to continuously rebuild after each change, without needing to re-run `npm run build`:

```sh
$ npm run watch
```

4. Load the extension temporarily within Podman Desktop:

We will load the extension within Podman Desktop to test it. This requires cloning the [Podman Desktop repo](https://github.com/containers/podman-desktop):

```sh
$ git clone https://github.com/containers/podman-desktop
```

Navigate to the directory:

```sh
$ cd podman-desktop
```

Run the `npm install` command:

```sh
$ npm install
```

Load the extension using the `npm run watch` command with an additional parameter to load the `backend` packaged data:

```sh
npm run watch --extension-folder ../podman-desktop-extension-minimal-template
```

5. Confirm that the extension has been loaded:

You can now see that your extension has been loaded by checking the **Extensions** section of Podman Desktop:

![loaded](/images/loaded.png)

A "Hello World" dialog will also appear on each activation:

![helloworld notification](/images/helloworld_notification.png)

## Packaging and Publishing

More information on how to package and publish your extension can be found in our [official publishing documentation](https://podman-desktop.io/docs/extensions/publish).

However, we have provided a pre-made Containerfile in this template for you to try.

1. Package your extension by building the image:

```sh
$ podman build -t quay.io/myusername/myextension .
```

2. Push the extension to an external registry:

```sh
$ podman push quay.io/myusername/myextension
```

3. Install via the Podman Desktop "Install Custom..." button:

![custom install](/images/custom_install.png)
