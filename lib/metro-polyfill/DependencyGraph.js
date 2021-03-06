/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */

'use strict';function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const AssetResolutionCache = require('./AssetResolutionCache');
const DependencyGraphHelpers = require('./DependencyGraph/DependencyGraphHelpers');
const FilesByDirNameIndex = require('./FilesByDirNameIndex');
const JestHasteMap = require('jest-haste-map');
const Module = require('./Module');
const ModuleCache = require('./ModuleCache');
const ResolutionRequest = require('./DependencyGraph/ResolutionRequest');

const fs = require('fs');
const path = require('path');
const toLocalPath = require('../node-haste/lib/toLocalPath');var _require =

require('./DependencyGraph/ModuleResolution');const ModuleResolver = _require.ModuleResolver;var _require2 =
require('events');const EventEmitter = _require2.EventEmitter;var _require3 =


require('metro-core'),_require3$Logger = _require3.Logger;const createActionStartEntry = _require3$Logger.createActionStartEntry,createActionEndEntry = _require3$Logger.createActionEndEntry,log = _require3$Logger.log;






















const JEST_HASTE_MAP_CACHE_BREAKER = 3;

class DependencyGraph extends EventEmitter {










  constructor(config)




  {
    super();this.





























































































































































    _doesFileExist = filePath => {
      return this._hasteFS.exists(filePath);
    };this._opts = config.opts;this._filesByDirNameIndex = new FilesByDirNameIndex(config.initialHasteFS.getAllFiles());this._assetResolutionCache = new AssetResolutionCache({ assetExtensions: new Set(config.opts.assetExts), getDirFiles: dirPath => this._filesByDirNameIndex.getAllFiles(dirPath), platforms: config.opts.platforms });this._haste = config.haste;this._hasteFS = config.initialHasteFS;this._moduleMap = config.initialModuleMap;this._helpers = new DependencyGraphHelpers(this._opts);this._haste.on('change', this._onHasteChange.bind(this));this._moduleCache = this._createModuleCache();this._createModuleResolver();}static _createHaste(opts) {let useWatchman = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;return new JestHasteMap({ computeSha1: true, extensions: opts.sourceExts.concat(opts.assetExts), forceNodeFilesystemAPI: !useWatchman, hasteImplModulePath: opts.hasteImplModulePath, ignorePattern: opts.blacklistRE || / ^/, maxWorkers: opts.maxWorkers, mocksPattern: '', name: 'metro-' + JEST_HASTE_MAP_CACHE_BREAKER, platforms: Array.from(opts.platforms), providesModuleNodeModules: opts.providesModuleNodeModules, retainAllFiles: true, roots: opts.projectRoots, throwOnModuleCollision: false, useWatchman, watch: opts.watch });}static _getJestHasteMapOptions(opts) {}static load(opts) {let useWatchman = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;return _asyncToGenerator(function* () {const initializingMetroLogEntry = log(createActionStartEntry('Initializing Metro'));opts.reporter.update({ type: 'dep_graph_loading' });const haste = DependencyGraph._createHaste(opts, useWatchman);var _ref = yield haste.build();const hasteFS = _ref.hasteFS,moduleMap = _ref.moduleMap;log(createActionEndEntry(initializingMetroLogEntry));opts.reporter.update({ type: 'dep_graph_loaded' });return new DependencyGraph({ haste, initialHasteFS: hasteFS, initialModuleMap: moduleMap, opts });})();}_getClosestPackage(filePath) {const parsedPath = path.parse(filePath);const root = parsedPath.root;let dir = parsedPath.dir;do {const candidate = path.join(dir, 'package.json');if (this._hasteFS.exists(candidate)) {return candidate;}dir = path.dirname(dir);} while (dir !== '.' && dir !== root);return null;}_onHasteChange(_ref2) {let eventsQueue = _ref2.eventsQueue,hasteFS = _ref2.hasteFS,moduleMap = _ref2.moduleMap;this._hasteFS = hasteFS;this._filesByDirNameIndex = new FilesByDirNameIndex(hasteFS.getAllFiles());this._assetResolutionCache.clear();this._moduleMap = moduleMap;eventsQueue.forEach((_ref3) => {let type = _ref3.type,filePath = _ref3.filePath;return this._moduleCache.processFileChange(type, filePath);});this._createModuleResolver();this.emit('change');}_createModuleResolver() {this._moduleResolver = new ModuleResolver({ dirExists: filePath => {try {return fs.lstatSync(filePath).isDirectory();} catch (e) {}return false;}, doesFileExist: this._doesFileExist, extraNodeModules: this._opts.extraNodeModules, isAssetFile: filePath => this._helpers.isAssetFile(filePath), moduleCache: this._moduleCache, moduleMap: this._moduleMap, preferNativePlatform: true, resolveAsset: (dirPath, assetName, platform) => this._assetResolutionCache.resolve(dirPath, assetName, platform), resolveRequest: this._opts.resolveRequest, sourceExts: this._opts.sourceExts });}_createModuleCache() {const _opts = this._opts;return new ModuleCache({ getClosestPackage: this._getClosestPackage.bind(this) });}getSha1(filename) {// TODO Calling realpath allows us to get a hash for a given path even when
    // it's a symlink to a file, which prevents Metro from crashing in such a
    // case. However, it doesn't allow Metro to track changes to the target file
    // of the symlink. We should fix this by implementing a symlink map into
    // Metro (or maybe by implementing those "extra transformation sources" we've
    // been talking about for stuff like CSS or WASM).
    const resolvedPath = fs.realpathSync(filename);const sha1 = this._hasteFS.getSha1(resolvedPath);if (!sha1) {throw new ReferenceError(`SHA-1 for file ${filename} is not computed`);}return sha1;}getWatcher() {return this._haste;}end() {this._haste.end();}resolveDependency(from, to, platform) {const req = new ResolutionRequest({ moduleResolver: this._moduleResolver, entryPath: from, helpers: this._helpers, platform: platform || null, moduleCache: this._moduleCache });return req.resolveDependency(this._moduleCache.getModule(from), to).path;}getHasteName(filePath) {const hasteName = this._hasteFS.getModuleName(filePath);if (hasteName) {return hasteName;
    }

    return toLocalPath(this._opts.projectRoots, filePath);
  }}


module.exports = DependencyGraph;