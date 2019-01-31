/*
 * Copyright © 2019 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */

const fs = require('fs')
const path = require('path')
const util = require('./util')

const liquidcore_version = '0.6.0'

;(() => {
  const gradle = (override) => {
    var args = {
      version : liquidcore_version
    }
    Object.assign(args, override)

    if (args.help) {
      console.log('')
      console.log('Generates liquidcore.build.gradle and optionally liquidcore.settings.gradle')
      console.log("files which should be included by your Android project's gradle files")
      console.log('to configure LiquidCore and any required addons.')
      console.log('')
      console.log('Usage:')
      console.log('  liquidcore gradle [<options>]')
      console.log('')
      console.log('Where <options> are:')
      console.log('  --dev                Configures for building addons locally out of node_modules')
      console.log('  --version=<version>  Use specific version of LiquidCore (default: ' + liquidcore_version +')')
      console.log('  --liquidcore=<path>  Use local build of LiquidCore (mutually exclusive with --version)')
      console.log('')
      console.log('If you need to install liquidcore addons, specify them in a local package.json file')
      console.log('and run `npm install` before running this command.')
      console.log('')
      process.exit(0)
    }

    if (args.liquidcore && args.liquidcore[0] === '~') {
      args.liquidcore = path.join(process.env.HOME, args.liquidcore.slice(1));
    }

    if (args.liquidcore && fs.existsSync(path.resolve(args.liquidcore))) {
      if (fs.statSync(path.resolve(args.liquidcore)).isDirectory())
        args.liquidcore = args.liquidcore + '/LiquidCoreAndroid'
    }
    if (args.liquidcore && !fs.existsSync(path.resolve(args.liquidcore))) {
      console.error('LiquidCore project cannot be found at ' + args.liquidcore);
      process.exit(-2)
    }

    let build_gradle =
      "dependencies {\n" +
      "    /* LiquidCore */\n" +
      "    if (findProject(':LiquidCore') != null) {\n" +
      "        implementation project(':LiquidCore')\n" +
      "    } else {\n" +
      "        implementation 'com.github.LiquidPlayer:LiquidCore:"+liquidcore_version+"'\n" +
      "    }\n\n"

    let settings_gradle = ''
    if (args.liquidcore) {
      settings_gradle +=
      "/* LiquidCore */\n" +
      "include ':LiquidCore'\n" +
      "project(':LiquidCore').projectDir = new File(\n" +
      "        rootProject.projectDir, '"+args.liquidcore+"')\n\n"
    }

    let modules = []
    util.recurse_packages('.', 'node_modules', (package, resolved) => {
      let addon = package['liquidcore-addon']
      let android = addon && addon.android
      let android_dev = addon && addon['android-dev']
      if (android || android_dev) {
        let module = { name: package.name, module: path.basename(resolved) }
        if (android) {
          let aar = path.resolve(resolved, android + '.aar')
          try {
            fs.realpathSync(aar)
            module.android = path.relative(path.resolve('.'), aar)
          } catch (e) {
            console.warn("WARN: '%s' does not exist, skipping", aar)
          }
        }
        if (android_dev) {
          let pth = path.resolve(resolved, android_dev)
          try {
            fs.realpathSync(pth)
            module.android_dev = path.relative(path.resolve('.'), pth)
          } catch (e) {
            console.warn("WARN: Project directory '%s' does not exist, skipping", pth)
          }
        }
        if (module.android || module.android_dev) {
          modules.push(module)
        }
      }
    })

    // Clean up and de-dupe modules
    // Precedence rules:
    // 1. dev > release
    // 2. relative path closest to root wins
    clean_modules = {}
    modules.forEach(p => {
      let current = clean_modules[p.name]
      if (current !== undefined) {
        if (!p.android_dev && current.android_dev) return // Rule 1
        ;if (current.android_dev && current.android_dev.length < p.android_dev.length) return // Rule 2
        ;if (current.android && !p.android_dev && (!p.android || current.android.length < p.android.length)) return
      }
      clean_modules[p.name] = p
    })

    Object.keys(clean_modules).forEach(k => {
      let android = clean_modules[k].android
      let android_dev = clean_modules[k].android_dev
      let m = clean_modules[k].module
      if (android || android_dev) {
        build_gradle +=
        "    /* AddOn: "+ m +" */\n" +
        "    if (findProject(':"+m+"') != null) {\n" +
        "        implementation project(':"+m+"')\n"
        if (android) {
          build_gradle +=
          "    } else {\n" +
          "        implementation(path:new File(rootProject.projectDir, '"+android+"'), ext:'aar')\n"
        }
        build_gradle +=
          "    }\n\n"
        if (!android || (args.dev && android_dev)) {
          settings_gradle +=
          "/* AddOn: "+m+" */\n" +
          "include ':"+m+"'\n" +
          "project(':"+m+"').projectDir = new File(\n" +
          "        rootProject.projectDir, '"+android_dev+"')\n\n"
        }
      }
    })

    build_gradle += '}\n'

    console.log("Created gradle include file(s) for your app.")
    console.log("In your project's build.gradle, add the jitpack repository:\n")
    console.log(
      "\033[1mallprojects {\n" +
      "  repositories {\n" +
      "    ...\n" +
      "    maven { url 'https://jitpack.io' }\n" +
      "  }\n" +
      "}\033[0m\n\n")

    fs.writeFileSync('liquidcore.build.gradle', build_gradle)
    console.log("In your app's build.gradle file, add the following line at the top:")
    console.log("")
    console.log("\033[1mapply from: new File(rootProject.projectDir, 'liquidcore.build.gradle')\033[0m")
    console.log("")

    if (settings_gradle != '') {
      fs.writeFileSync('liquidcore.settings.gradle', settings_gradle)
      console.log("In your project's settings.gradle file, add the following line at the end:")
      console.log("")
      console.log("\033[1mapply from: 'liquidcore.settings.gradle'\033[0m")
      console.log("")
    }
  }

  module.exports = gradle
})()