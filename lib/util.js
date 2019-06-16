const fs = require('fs')
const path = require('path')
const https = require('https')

;(() => {
  let resolved_paths = []

  function process(p, file, found) {
    let resolved = path.resolve(p, file)
    let real
    try {
      real = fs.realpathSync(resolved)
    } catch (e) {
      return
    }
    if (resolved_paths.includes(real)) return; // Don't get stuck in an endless loop
    resolved_paths.push(real)

    try {
      const stat = fs.statSync(resolved)
      if (stat.isDirectory()) {
        if (file == 'node_modules' || file[0] == '@') {
          return fs.readdirSync(resolved).forEach(m => process(resolved, m, found))
        } else {
          try {
            let package = JSON.parse(fs.readFileSync(path.resolve(resolved, 'package.json')))
            let addon = package && package['liquidcore-addon']
            if (addon) {
              found(package, resolved)
            }
            return fs.readdirSync(resolved).forEach(m => process(resolved, m, found))
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  const version = (s) => s.split('.').map((v,n) =>
    (s.length-n-1)*100*parseInt(v)).reduce((p,v)=>Number.isInteger(v)?p+v:v)

  function get_latest_version() {
    return new Promise((resolve,reject) => {
      const options = {
        host: 'api.github.com',
        port: 443,
        path: '/repos/LiquidPlayer/LiquidCore/releases/latest',
        method: 'GET'
      }
      const request = https.request(options, (response) => {
        response.setEncoding('utf8');
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error('Failed to load page, status code: ' + response.statusCode))
        }
        const body = []
        response.on('data', (chunk) => body.push(chunk))
        response.on('end', () => resolve(JSON.parse(body.join('')).tag_name))
      })
      request.on('error', (err) => reject(err))
      request.setHeader('User-Agent', 'curl/7.54.0')
      request.end()
    })
  }

  module.exports = {
    recurse_packages : process,
    version : version,
    get_latest_version : get_latest_version
  }
})()