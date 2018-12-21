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
const SURFACE = __surface_canonical_name__

const init_surface = (surface) => surface.attach()

const start_microapp = (surface) => {
    // Start the micro app!
    require('./index')

    return Promise.resolve()
}

LiquidCore
    .bind(SURFACE)
    .then(init_surface)
    .then(start_microapp)
    .then(() => {
        console.log('Micro app is running!')
    })
    .catch((error) => {
        console.error('Micro app failed to start.  Reason:')
        console.error(error);
    })
