/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */
'use strict';

(() => {
  const path = require('path');
  const fs = require('fs');
  const resolve = require('metro-resolver').resolve;

  const local_path = path.resolve('.') + '/node_modules/';

  try {
    global.liquidcore_config = require(path.resolve('.', 'liquidcore.config'))
  } catch (e) {
    global.liquidcore_config = { filterReplacements: ['browser'] };
  }

  // FIXME: This is a very ugly hack.  Metro assumes that we are bundling
  // for the browser, but in our case, we are not.  In the various package.json files
  // it is hardcoded to look for the "react-native" and "browser" properties.  In newer
  // versions of metro, this is configurable with the `resolver.resolverMainFields` config
  // parameter, but not in the version packaged with React Native 0.56.  So for now, we
  // have to overwrite that file locally to not do that.  This will maintain compatibility
  // with React Native.
  try {
    fs.writeFileSync(local_path + 'react-native/node_modules/metro/src/node-haste/Package.js',
      fs.readFileSync(path.resolve(__dirname, 'metro-polyfill/Package.js'))
    );
  } catch (e) {}
  fs.writeFileSync(local_path + 'metro/src/node-haste/Package.js',
    fs.readFileSync(path.resolve(__dirname, 'metro-polyfill/Package.js'))
  );

  // Similarly, there is no good way to save the system `require()` before metro overwrites
  // it.  Plus metro does not handle cyclic dependencies well at all.  We fix these by
  // using our own implementation of metroRequire.
  try {
    fs.writeFileSync(local_path + 'react-native/node_modules/metro/src/defaults.js',
      fs.readFileSync(path.resolve(__dirname, 'metro-polyfill/defaults.js'))
    );
  } catch (e) {
    fs.writeFileSync(local_path + 'metro/src/defaults.js',
      fs.readFileSync(path.resolve(__dirname, 'metro-polyfill/defaults.js'))
    );
  }

  const configure = (config) => {
    // Do not add all the react-native junk by default.  This needs to be done
    // explicitly by clients as the React Native environment won't be set up
    // until after the surface is bound; not at initial execution
    config.getModulesRunBeforeMainModule = () => [];

    // Node built-in modules need to bypass `metroRequire` and use the good
    // old fashioned node `require`
    let extraNodeModules = {};
    const nativenode = fs.readdirSync(path.resolve(__dirname, 'node-native')).map((t) => t.split('.')[0]);
    nativenode.forEach(dep => {
      extraNodeModules[dep] = path.resolve(__dirname, "node-native", dep);
    });
    config.extraNodeModules = extraNodeModules;

    // There appears to be a bug in metro-resolver where context.redirectModulePath() may
    // inexplicably return 'false' which then throws an exception.  Ignoring the redirect
    // in that case makes the problem go away
    config.resolveRequest = (context, moduleName, platform) => {
      let origRedirectModulePath = context.redirectModulePath;
      context.redirectModulePath = (o) => origRedirectModulePath(o) || o;
      context.resolveRequest = null;
      return resolve(context, moduleName, platform);
    }

    // We do not need the ES6 polyfill because ES6 is available on both V8 packaged with
    // LiquidCore Android, and on JavaScriptCore iOS.  The polyfill can, in fact, cause
    // problems in some modules.
    const filter_es6 = config.getPolyfills().filter((m)=>!m.includes(".es6."));
    config.getPolyfills = () => filter_es6;

    return config;
  };

  module.exports = configure;

})();