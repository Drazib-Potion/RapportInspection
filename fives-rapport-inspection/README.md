## Getting Started with Create React App + Electron

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and now ships with a tiny Electron shell (typed in TypeScript) that points at the React bundle.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser; the page reloads on edits and logs lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.\
See [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more info.

### `npm run build`

Builds the app for production to the `build` folder.\
It bundles React in production mode, minifies the output, and includes hashed filenames.

See [deployment](https://facebook.github.io/create-react-app/docs/deployment) for additional guidance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

Choose eject when you need full control over the build tooling. This copies the configuration files and dependencies (webpack, Babel, ESLint, etc.) into your project so you can adjust them directly. All remaining scripts keep working but now point at the copied code.

## Electron workflow

### `npm run electron:dev`

Compiles the Electron main/preload scripts to `dist/electron`, then launches Electron pointing at `http://localhost:3000`. Run `npm start` in another terminal before this command so the React dev server is available.

### `npm run electron`

Builds the React bundle and compiles the Electron native layer, then launches Electron so it loads `build/index.html`.

### `npm run electron:build`

Compiles the Electron TypeScript files only. The other Electron scripts call this automatically, but you can run it directly if you want to test changes to the native code without rebuilding the React UI.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
