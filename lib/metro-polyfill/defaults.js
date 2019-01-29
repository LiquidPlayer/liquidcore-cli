/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';

exports.assetExts = [
// Image formats
'bmp',
'gif',
'jpg',
'jpeg',
'png',
'psd',
'svg',
'webp',
// Video formats
'm4v',
'mov',
'mp4',
'mpeg',
'mpg',
'webm',
// Audio formats
'aac',
'aiff',
'caf',
'm4a',
'mp3',
'wav',
// Document formats
'html',
'pdf',
// Font formats
'otf',
'ttf'];


exports.sourceExts = ['js', 'json'];

// LiquidCore: Use our own version of `require.js`
exports.moduleSystem = require.resolve('liquidcore-cli/lib/metro-polyfill/require.js');

exports.platforms = ['ios', 'android', 'windows', 'web'];

exports.providesModuleNodeModules = ['react-native', 'react-native-windows'];

exports.transformModulePath = require.resolve('./defaultTransformer');

exports.DEFAULT_METRO_MINIFIER_PATH = 'metro-minify-uglify';