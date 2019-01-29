/*
 * Copyright © 2019 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */

const fs = require('fs')
const path = require('path')

const liquidcore_version = '0.6.0'
const default_ios_target_version = '10.0'

;(() => {
  const pod = (override) => {
    var args = {
      'ios-version' : default_ios_target_version,
      version : liquidcore_version
    }
    Object.assign(args, override)

    if (args.help) {
      console.log('')
      console.log('Generates a Podfile which contains the cocoapods required to configure')
      console.log('LiquidCore and any required addons.  The output will go to stdout.  If')
      console.log('you already have a Podfile, copy the source and pod inclusion lines into')
      console.log('it.  Otherwise, you can just redirect output to Podfile (e.g. ')
      console.log('`liquidcore pod MyTarget > Podfile`).  Be sure to run `pod install` afterwards.')
      console.log('')
      console.log('Usage:')
      console.log('liquidcore pod <target> [<options>]')
      console.log('')
      console.log('Where:')
      console.log('  <target>                  Build target project')
      console.log('  <options>                 One or more of the following:')
      console.log('    --dev                   Configures for building addons locally out of node_modules')
      console.log('    --version=<version>     Use specific version of LiquidCore (default: ' + liquidcore_version +')')
      console.log('    --liquidcore=<path>     Use local build of LiquidCore (mutually exclusive with --version)')
      console.log('    --ios-version=<version> Target minimum iOS version (default: ' + default_ios_target_version +')')
      console.log('')
      console.log('If you need to install liquidcore addons, specify them in a local package.json file')
      console.log('and run `npm install` before running this command.')
      process.exit(0)
      console.log('')
    }

    if (args._.length < 1) {
      console.error('Target must be specified.')
      process.exit(-1)
    }

    if (args.liquidcore && args.liquidcore[0] === '~') {
      args.liquidcore = path.join(process.env.HOME, args.liquidcore.slice(1));
    }

    if (args.liquidcore && fs.existsSync(path.resolve(args.liquidcore))) {
      if (fs.statSync(path.resolve(args.liquidcore)).isDirectory())
        args.liquidcore = args.liquidcore + '/LiquidCore.podspec'
    }
    if (args.liquidcore && !fs.existsSync(path.resolve(args.liquidcore))) {
      console.error('LiquidCore project cannot be found at ' + args.liquidcore);
      process.exit(-2)
    }

    let node_modules = path.resolve('.', 'node_modules')
    let modules = fs.readdirSync(node_modules)
    let podfile =
      "platform :ios, '10.0'\n" +
      "use_frameworks!\n\n" +
      "target '"+args._[0]+"' do\n"

    if (args.liquidcore) {
      podfile += "  pod 'LiquidCore', :path => '"+args.liquidcore+"'\n"
    } else {
      throw new Error('FIXME')
    }

    modules.forEach(m => {
      try {
        let package = JSON.parse(fs.readFileSync(path.resolve(node_modules, m, 'package.json')))
        let addon = package && package['liquidcore-addon']
        let ios = addon && addon.ios
        let ios_dev = addon && addon['ios-dev']
        if (ios || ios_dev) {
          if (!ios || (ios_dev && args.dev)) {
            podfile += "  pod '"+ios_dev.name+"', :path => './node_modules/"+m+"/"+ios_dev.path+"'\n"
          } else {
            throw new Error('FIXME')
          }
        }
      } catch (e) {}
    })

    podfile += "end\n"

    console.log(podfile)
  }

  module.exports = pod
})()