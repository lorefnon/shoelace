# Installation

You can use Shoelace via CDN or by installing it locally.

## CDN Installation (Recommended)

The easiest way to install Shoelace is with the CDN. Just add the following tags to your page.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@%VERSION%/dist/themes/base.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@%VERSION%/dist/all.shoelace.js"></script>
```

Now you can [start using Shoelace!](/getting-started/usage.md)

## Local Installation

If you don't want to use the CDN, you can install Shoelace locally with the following command. 

```bash
npm install @shoelace-style/shoelace
```

It's up to you to make the source files available to your app. One way to do this is to create a route in your app called `/scripts/shoelace` that serves static files from `node_modules/@shoelace-style/shoelace`. 

Once you've done that, add the following tags to your page. Make sure to update `href` and `src` so they point to the route you created.

```html
<link rel="stylesheet" href="/scripts/shoelace/dist/themes/base.css">
<script type="module" src="/scripts/shoelace/dist/all.shoelace.js"></script>
```

## Setting the Base Path

Some components rely on assets (icons, images, etc.) and Shoelace needs to know where they're located. For convenience, Shoelace will try to auto-detect the correct location based on the script you've loaded it from. This assumes assets are colocated with `shoelace.js` and will "just work" for most users.

However, if you're [cherry picking](#cherry-picking) or [bundling](#bundling) Shoelace, you'll need to set the base path. You can do this one of two ways. The following examples assumes you're serving Shoelace's `dist` directory from `/scripts/shoelace`.

```html
<!-- Option 1: the data-shoelace attribute -->
<script src="bundle.js" data-shoelace="/scripts/shoelace"></script>

<!-- Option 2: the setBasePath() method -->
<script src="bundle.js"></script>
<script type="module">
  import { setBasePath } from '/scripts/shoelace/dist/utilities/base-path.js';
  setBasePath('/scripts/shoelace');
</script>
```

?> The library also exports a `getBasePath()` method you can use to reference assets.

## Cherry Picking

The previous approach is the _easiest_ way to load Shoelace, but easy isn't always efficient. You'll incur the full size of the library even if you only use a handful of components. This is convenient for prototyping, but may result in longer load times in production. To improve this, you can cherry pick the components you need.

Cherry picking can be done from your local install or [directly from the CDN](https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@%VERSION%/). This will limit the number of files the browser has to download and reduce the amount of bytes being transferred. The disadvantage is that you need to load and register each component manually, including its dependencies.

Here's an example that loads only the button component and its dependencies.

```html
<!-- The base stylesheet is always required -->
<link rel="stylesheet" href="/scripts/shoelace/dist/themes/base.css">

<script type="module" data-shoelace="/scripts/shoelace">
  import SlButton from '/scripts/shoelace/dist/components/button/button.js';
  import SlSpinner from '/scripts/shoelace/dist/components/spinner/spinner.js';
  
  SlButton.register();
  SlSpinner.register(); // spinner is a dependency of button
</script>
```

If a component has dependencies, they'll be listed in the "Dependencies" section of its documentation. These are always Shoelace components, not third-party libraries. For example, `<sl-button>` requires you to load `<sl-spinner>` because it's used internally for its loading state.

!> Never cherry pick from `all.shoelace.js` or `shoelace.js` as this will cause the browser to load the entire library. Instead, cherry pick from component modules as shown above.

!> You may see files named `chunk.[hash].js` in the `dist` directory. Never reference these files directly, as they change from version to version. Instead, import the corresponding component or utility file.

## Bundling

Shoelace is distributed as a collection of standard ES modules that [all modern browsers can understand](https://caniuse.com/es6-module). However, importing a lot of modules can result in a lot of HTTP requests and potentially longer load times. Using a CDN can alleviate this, but some users may wish to further optimize their imports with a bundler.

To use Shoelace with a bundler, first install Shoelace as well as your bundler of choice.

```bash
npm install @shoelace-style/shoelace
```

Now it's time to configure your bundler. Configurations vary for each tool, but here are some examples to help you get started.

- [Example webpack config](https://github.com/shoelace-style/webpack-example/blob/master/webpack.config.js)
- [Example Rollup config](https://github.com/shoelace-style/rollup-example/blob/master/rollup.config.js)

Once your bundler is configured, you'll be able to import Shoelace components and utilities.

```js
import '@shoelace-style/shoelace/dist/shoelace.css';
import { setBasePath, SlButton, SlIcon, SlInput, SlRating } from '@shoelace-style/shoelace';

// Set the pase path to the folder you copied Shoelace's assets to
setBasePath('/dist/shoelace');

SlButton.register();
SlIcon.register();
SlInput.register();
SlRating.register();

// <sl-button>, <sl-icon>, <sl-input>, and <sl-rating> are ready to use!
```

Note that you need to register each component manually to add them to the custom element registry. Components aren't automatically registered to prevent bundlers from treeshaking them.
