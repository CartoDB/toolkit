# CARTO Toolkit - New Web-SDK!

This is a monorepo intended to contain all small-medium sized JS libraries that are used to create CARTO Apps. Currently contains:

- An auth library, mainly for OAuth.
- A SQL API library.
- A Custom Visualizations library.
- A Viz library, built on top of deck.gl
- A Metapackage that exposes all

It uses [Lerna](https://lerna.js.org) to manage all the packages and inter-dependencies.

Quick steps to check that build works correctly

```sh
 nvm use
 npm install
 npm run build
```
