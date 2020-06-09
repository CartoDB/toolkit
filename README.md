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

## Development

### Linking Deck.gl
In order to work with your local version of Deck.gl in this project, you need to link the Deck.gl module or modules (take into account Deck.gl is a lerna project too, so it is a bunch of different projects) you need into this one.

- In the root of deck.gl project
```
yarn build
```

- Move to the module you want to link (in this example we want to link @deck.gl/layers)
```
cd modules/layers/
npm link
```

- In the root of the toolkit project
```
npm link @deck.gl/layers
```
