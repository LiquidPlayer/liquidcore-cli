/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @polyfill
 * 
 * @format
 */

'use strict';

/* eslint-disable no-bitwise */

/* If we are running outside of LiquidCore (i.e. testing in node on desktop), override the
 * `require()` function so that we can search ./node_modules/ for native `.node` addons.
 * Emit a warning so that developers know that they need to provide a LiquidCore-specific
 * addon to work inside the LiquidCore environment or replace with a js-only implementation.
 *
 * Algorithm borrowed from the `bindings` project: https://github.com/TooTallNate/node-bindings
 * Copyright (c) 2012 Nathan Rajlich <nathan@tootallnate.net>
 */
if (global.LiquidCore === undefined) {
  const native_require = require;

  const fs = require('fs')
      , path = require('path')
      , join = path.join
      , dirname = path.dirname
      , exists = ((fs.accessSync && function (path) { try { fs.accessSync(path); } catch (e) { return false; } return true; })
          || fs.existsSync || path.existsSync)
      , defaults = {
          arrow: process.env.NODE_BINDINGS_ARROW || ' → '
          , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
          , platform: process.platform
          , arch: process.arch
          , version: process.versions.node
          , bindings: 'bindings.node'
          , try: [
              // node-gyp's linked version in the "build" dir
              [ 'module_root', 'build', 'bindings' ]
              // node-waf and gyp_addon (a.k.a node-gyp)
              , [ 'module_root', 'build', 'Debug', 'bindings' ]
              , [ 'module_root', 'build', 'Release', 'bindings' ]
              // Debug files, for development (legacy behavior, remove for node v0.9)
              , [ 'module_root', 'out', 'Debug', 'bindings' ]
              , [ 'module_root', 'Debug', 'bindings' ]
              // Release files, but manually compiled (legacy behavior, remove for node v0.9)
              , [ 'module_root', 'out', 'Release', 'bindings' ]
              , [ 'module_root', 'Release', 'bindings' ]
              // Legacy from node-waf, node <= 0.4.x
              , [ 'module_root', 'build', 'default', 'bindings' ]
              // Production "Release" buildtype binary (meh...)
              , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
              ]
          }

  function bindings (opts) {
      // Argument surgery
      if (typeof opts == 'string') {
          opts = { bindings: opts }
      } else if (!opts) {
          opts = {}
      }

      // maps `defaults` onto `opts` object
      Object.keys(defaults).map(function(i) {
          if (!(i in opts)) opts[i] = defaults[i];
      });

      // Ensure the given bindings name ends with .node
      if (path.extname(opts.bindings) != '.node') {
          opts.bindings += '.node'
      }

      var requireFunc = native_require
      var tries = []
          , i = 0
          , l = opts.try.length
          , n
          , b
          , err

      let modules = fs.readdirSync(path.resolve('.', 'node_modules'))
      for (var j=0; j<modules.length; j++) {
          opts.module_root = modules[j]
          for (i=0; i<l; i++) {
              n = join.apply(null, opts.try[i].map(function (p) {
                  return opts[p] || p
              }))
              tries.push(n)
              try {
                  b = opts.path ? requireFunc.resolve(n) : requireFunc(n)
                  if (!opts.path) {
                      b.path = n
                  }
                  return b
              } catch (e) {
                  if (!/not find/i.test(e.message)) {
                      throw e
                  }
              }
          }
      }

      err = new Error('Could not locate the bindings file. Tried:\n'
          + tries.map(function (a) { return opts.arrow + a }).join('\n'))
      err.tries = tries
      throw err
  }

  global.node_require = (module) => {
      if (path.extname(module) == '.node') {
          console.warn('WARN: Attempting to bind native module ' + path.basename(module))
          console.warn('WARN: Consider using a browser implementation or make sure you have a LiquidCore addon.')

          return bindings(path.basename(module))
      }

      return native_require(module)
  };
} else {
  global.node_require = require
}

// Used to include paths in production bundles for traces of performance tuned runs
// e.g. to update fbandroid/apps/fb4a/compiled_react_native_modules.txt
// Make sure to set PASS_MODULE_PATHS_TO_DEFINE = true too, and restart Metro.
const PRINT_REQUIRE_PATHS = false;

global.__non_webpack_require__ = global.node_require;

global.__webpack_require__ = metroRequire;
global.require = metroRequire;
global.__d = define;

const modules =
typeof __NUM_MODULES__ === 'number' ?
Array(__NUM_MODULES__ | 0) :
Object.create(null);
if (__DEV__) {
  var verboseNamesToModuleIds =


  Object.create(null);
}

function define(
factory,
moduleId,
dependencyMap)
{
  if (modules[moduleId] != null) {
    if (__DEV__) {
      // (We take `inverseDependencies` from `arguments` to avoid an unused
      // named parameter in `define` in production.
      const inverseDependencies = arguments[4];

      // If the module has already been defined and the define method has been
      // called with inverseDependencies, we can hot reload it.
      if (inverseDependencies) {
        global.__accept(moduleId, factory, dependencyMap, inverseDependencies);
      } else {
        console.warn(
        `Trying to define twice module ID ${moduleId} in the same bundle`);

      }
    }

    // prevent repeated calls to `global.nativeRequire` to overwrite modules
    // that are already loaded
    return;
  }
  modules[moduleId] = {
    dependencyMap,
    exports: undefined,
    factory,
    hasError: false,
    isInitialized: false,
    isCyclic: false };

  if (PRINT_REQUIRE_PATHS) {
    const path = arguments[4];
    if (path) {
      modules[moduleId].path = path;
    } else {
      throw new Error(
      'path not set on module with PRINT_REQUIRE_PATHS true. Make sure ' +
      'PASS_MODULE_PATHS_TO_DEFINE is true and restart Metro or rebuild bundle');

    }
  }
  if (__DEV__) {
    // HMR
    modules[moduleId].hot = createHotReloadingObject();

    // DEBUGGABLE MODULES NAMES
    // we take `verboseName` from `arguments` to avoid an unused named parameter
    // in `define` in production.
    const verboseName = arguments[3];
    if (verboseName) {
      modules[moduleId].verboseName = verboseName;
      verboseNamesToModuleIds[verboseName] = moduleId;
    }
  }
}

/*
 * EWL for LiquidCore: Cyclic depedencies are not handled well in Metro.  Inner-included
 * modules will use exports from `module.exports`, but the property won't have been set yet, invariably
 * returning `undefined`.  To address this, if we detect that if a module is being included
 * cyclicly, instead of returning `module.exports`, we return a `Proxy` which dereferences
 * `module.exports` at runtime.  This way, `module.exports` can be set later, but still
 * correctly used by the cyclic dependency.  IMPORTANT LIMITATION: This, of course, only works if
 * `module.exports` is an `Object` or `Function` (which is typically the case in cyclic
 * modules).  If, for example, `module.exports` is eventually a `string`, this will result in an
 * exception at runtime.  So we only use the proxy when we know for sure that we are being
 * included cyclicly.
 */
function proxyModuleExports(module) {
  module.exports = function() {}
  const handler = {
    get : (t, p, r) => Reflect.get(module.exports,p,r),
    set : (t, p, v, r) => Reflect.set(module.exports,p,v,r),
    setPrototypeOf : (t, p) => Reflect.setPrototypeOf(module.exports,p),
    getPrototypeOf : (t) => Reflect.getPrototypeOf(module.exports),
    getOwnPropertyDescriptor : (t, p) => Reflect.getOwnPropertyDescriptor(module.exports,p),
    defineProperty : (t,p,d) => Reflect.defineProperty(module.exports,p,d),
    has : (t, p) => Reflect.has(module.exports,p),
    deleteProperty : (t, p) => Reflect.deleteProperty(module.exports,p),
    ownKeys : (t) => Reflect.ownKeys(module.exports),
    apply : (t, z, a) => Reflect.apply(module.exports,z,a),
    construct : (t, a, n) => Reflect.construct(module.exports,a,n),
    preventExtensions : (t) => Reflect.preventExtensions(module.exports),
    isExtensible : (t) => Reflect.isExtensible(module.exports)
  };
  return new Proxy(function(){}, handler);
}

function metroRequire(moduleId) {
  if (__DEV__ && typeof moduleId === 'string') {
    const verboseName = moduleId;
    moduleId = verboseNamesToModuleIds[verboseName];
    if (moduleId == null) {
      throw new Error(`Unknown named module: '${verboseName}'`);
    } else {
      console.warn(
      `Requiring module '${verboseName}' by name is only supported for ` +
      'debugging purposes and will BREAK IN PRODUCTION!');

    }
  }

  //$FlowFixMe: at this point we know that moduleId is a number
  const moduleIdReallyIsNumber = moduleId;
  const module = modules[moduleIdReallyIsNumber];
  return module && module.isCyclic ?
  proxyModuleExports(module) :
  module && module.isInitialized ?
  module.exports :
  guardedLoadModule(moduleIdReallyIsNumber, module);
}

let inGuard = false;
function guardedLoadModule(moduleId, module) {
  if (!inGuard && global.ErrorUtils) {
    inGuard = true;
    let returnValue;
    try {
      returnValue = loadModuleImplementation(moduleId, module);
    } catch (e) {
      global.ErrorUtils.reportFatalError(e);
    }
    inGuard = false;
    return returnValue;
  } else {
    return loadModuleImplementation(moduleId, module);
  }
}

const ID_MASK_SHIFT = 16;
const LOCAL_ID_MASK = ~0 >>> ID_MASK_SHIFT;

function unpackModuleId(
moduleId)
{
  const segmentId = moduleId >>> ID_MASK_SHIFT;
  const localId = moduleId & LOCAL_ID_MASK;
  return { segmentId, localId };
}
metroRequire.unpackModuleId = unpackModuleId;

function packModuleId(value) {
  return value.segmentId << ID_MASK_SHIFT + value.localId;
}
metroRequire.packModuleId = packModuleId;

function loadModuleImplementation(moduleId, module) {
  const nativeRequire = global.nativeRequire;
  if (!module && nativeRequire) {var _unpackModuleId =
    unpackModuleId(moduleId);const segmentId = _unpackModuleId.segmentId,localId = _unpackModuleId.localId;
    nativeRequire(localId, segmentId);
    module = modules[moduleId];
  }

  if (!module) {
    throw unknownModuleError(moduleId);
  }

  if (module.hasError) {
    throw moduleThrewError(moduleId, module.error);
  }

  // `metroRequire` calls into the require polyfill itself are not analyzed and
  // replaced so that they use numeric module IDs.
  // The systrace module will expose itself on the metroRequire function so that
  // it can be used here.
  // TODO(davidaurelio) Scan polyfills for dependencies, too (t9759686)
  if (__DEV__) {var
    Systrace = metroRequire.Systrace;
  }

  // We must optimistically mark module as initialized before running the
  // factory to keep any require cycles inside the factory from causing an
  // infinite require loop.
  module.isInitialized = true;
  module.isCyclic = true;
  const exports = module.exports = {};var _module =
  module;const factory = _module.factory,dependencyMap = _module.dependencyMap;
  try {
    if (PRINT_REQUIRE_PATHS) {
      console.log(`require file path ${module.path || 'unknown'}`); // eslint-disable-line no-console
    }
    if (__DEV__) {
      // $FlowFixMe: we know that __DEV__ is const and `Systrace` exists
      Systrace.beginEvent('JS_require_' + (module.verboseName || moduleId));
    }

    const moduleObject = { exports };
    if (__DEV__ && module.hot) {
      moduleObject.hot = module.hot;
    }

    // keep args in sync with with defineModuleCode in
    // metro/src/Resolver/index.js
    // and metro/src/ModuleGraph/worker.js
    factory(global, metroRequire, moduleObject, exports, dependencyMap);

    // avoid removing factory in DEV mode as it breaks HMR
    if (!__DEV__) {
      // $FlowFixMe: This is only sound because we never access `factory` again
      module.factory = undefined;
      module.dependencyMap = undefined;
    }

    if (__DEV__) {
      // $FlowFixMe: we know that __DEV__ is const and `Systrace` exists
      Systrace.endEvent();
    }
    module.isCyclic = false;
    return module.exports = moduleObject.exports;
  } catch (e) {
    module.hasError = true;
    module.error = e;
    module.isInitialized = false;
    module.isCyclic = false;
    module.exports = undefined;
    throw e;
  }
}

function unknownModuleError(id) {
  let message = 'Requiring unknown module "' + id + '".';
  if (__DEV__) {
    message +=
    'If you are sure the module is there, try restarting Metro Bundler. ' +
    'You may also want to run `yarn`, or `npm install` (depending on your environment).';
  }
  return Error(message);
}

function moduleThrewError(id, error) {
  const displayName = __DEV__ && modules[id] && modules[id].verboseName || id;
  return Error(
  'Requiring module "' +
  displayName +
  '", which threw an exception: ' +
  error);

}

if (__DEV__) {
  metroRequire.Systrace = { beginEvent: () => {}, endEvent: () => {} };

  metroRequire.getModules = () => {
    return modules;
  };

  // HOT MODULE RELOADING
  var createHotReloadingObject = function () {
    const hot = {
      acceptCallback: null,
      accept: callback => {
        hot.acceptCallback = callback;
      },
      disposeCallback: null,
      dispose: callback => {
        hot.disposeCallback = callback;
      } };

    return hot;
  };

  const metroAcceptAll = function (
  dependentModules,
  inverseDependencies,
  patchedModules)
  {
    if (!dependentModules || dependentModules.length === 0) {
      return true;
    }

    const notAccepted = dependentModules.filter(
    module =>
    !metroAccept(
    module,
    /*factory*/undefined,
    /*dependencyMap*/undefined,
    inverseDependencies,
    patchedModules));



    const parents = [];
    for (let i = 0; i < notAccepted.length; i++) {
      // if the module has no parents then the change cannot be hot loaded
      if (inverseDependencies[notAccepted[i]].length === 0) {
        return false;
      }

      parents.push.apply(parents, inverseDependencies[notAccepted[i]]);
    }

    return parents.length == 0;
  };

  const metroAccept = function (
  id,
  factory,
  dependencyMap,
  inverseDependencies)

  {let patchedModules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    if (id in patchedModules) {
      // Do not patch the same module more that once during an update.
      return true;
    }
    patchedModules[id] = true;

    const mod = modules[id];

    if (!mod && factory) {
      // New modules are going to be handled by the define() method.
      return true;
    }const

    hot = mod.hot;
    if (!hot) {
      console.warn(
      'Cannot accept module because Hot Module Replacement ' +
      'API was not installed.');

      return false;
    }

    if (hot.disposeCallback) {
      try {
        hot.disposeCallback();
      } catch (error) {
        console.error(
        `Error while calling dispose handler for module ${id}: `,
        error);

      }
    }

    // replace and initialize factory
    if (factory) {
      mod.factory = factory;
    }
    if (dependencyMap) {
      mod.dependencyMap = dependencyMap;
    }
    mod.hasError = false;
    mod.isInitialized = false;
    metroRequire(id);

    if (hot.acceptCallback) {
      try {
        hot.acceptCallback();
        return true;
      } catch (error) {
        console.error(
        `Error while calling accept handler for module ${id}: `,
        error);

      }
    }

    // need to have inverseDependencies to bubble up accept
    if (!inverseDependencies) {
      throw new Error('Undefined `inverseDependencies`');
    }

    // accept parent modules recursively up until all siblings are accepted
    return metroAcceptAll(
    inverseDependencies[id],
    inverseDependencies,
    patchedModules);

  };

  global.__accept = metroAccept;
}