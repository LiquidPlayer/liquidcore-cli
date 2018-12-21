/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
require('babel-polyfill')

import {name as appName} from './app.json';

const RNS = 'org.liquidplayer.surface.reactnative.ReactNativeSurface'
const RN_CONFIG = { dev : false };

// Don't import or require the React Native core at the global scope.  We
// must set up the bindings first!

const init_react = (surface) => {
    // Initialize React Native core
    require('react-native/Libraries/Core/InitializeCore')
    
    // Register React Native micro-app
    require('./index')
    
    // Attach the surface to our UI
    return surface.attach()
}

const start_microapp = (surface) => {
    // Start the micro app!
    surface.startReactApplication(appName)
    
    return Promise.resolve()
}

LiquidCore
    .bind(RNS, RN_CONFIG)
    .then(init_react)
    .then(start_microapp)
    .then(() => { 
        console.log('React Native micro app is running!')
    })
    .catch((error) => {
        console.error('React Native micro app failed to start.  Reason:')
        console.error(error);
    })
