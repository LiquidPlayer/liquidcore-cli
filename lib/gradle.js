/*
 * Copyright © 2019 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */

const fs = require('fs')
const path = require('path')

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
      exit(-2)
    }

    let node_modules = path.resolve('.', 'node_modules')
    let modules = fs.readdirSync(node_modules)
    let build_gradle =
      "dependencies {\n"
      "    /* LiquidCore */\n" +
      "    if (findProject(':LiquidCoreAndroid') != null) {\n" +
      "        implementation project(':LiquidCoreAndroid')\n" +
      "    } else {\n" +
      "        implementation 'com.github.LiquidPlayer:LiquidCore:"+liquidcore_version+"'\n" +
      "    }\n\n"

    let settings_gradle = ''
    if (args.liquidcore) {
      settings_gradle +=
      "/* LiquidCore */\n" +
      "include ':LiquidCoreAndroid'\n" +
      "project(':LiquidCoreAndroid').projectDir = new File(\n" +
      "        rootProject.projectDir, '"+args.liquidcore+"')\n\n"
    }
    modules.forEach(m => {
      try {
        let package = JSON.parse(fs.readFileSync(path.resolve(node_modules, m, 'package.json')))
        let addon = package && package['liquidcore-addon']
        let android = addon && addon.android
        let android_dev = addon && addon['android-dev']
        if (android || android_dev) {
          build_gradle +=
          "    /* AddOn: "+ m +" */\n" +
          "    if (findProject(':"+m+"') != null) {\n" +
          "        implementation project(':"+m+"')\n"
          if (android) {
            build_gradle +=
            "    } else {\n" +
            "        implementation(path:new File(rootProject.projectDir, 'node_modules/"+m+"/"+android+"'), ext:'aar')\n"
          }
          build_gradle +=
            "    }\n\n"
          if (!android || (args.dev && android_dev)) {
            settings_gradle +=
            "/* AddOn: "+m+" */\n" +
            "include ':"+m+"'\n" +
            "project(':"+m+"').projectDir = new File(\n" +
            "        rootProject.projectDir, 'node_modules/"+m+"/"+android_dev+"')\n\n"
          }
        }
      } catch (e) {}
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