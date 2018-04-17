#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const slash = require('slash')
const chalk = require('chalk')
const semver = require('semver')
const minimist = require('minimist')
const requiredVersion = require('../package.json').engines.node

// check node version
if (!semver.satisfies(process.version, requiredVersion)) {
  console.log(chalk.red(
    `You are using Node ${process.version}, but this version of hrkj-cli ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  ))
  process.exit(1)
}

// enter debug mode when creating test repo
if (
  slash(process.cwd()).indexOf('/packages/test') > 0 && (
    fs.existsSync(path.resolve(process.cwd(), '../@hrkj')) ||
    fs.existsSync(path.resolve(process.cwd(), '../../@hrkj'))
  )
) {
  process.env.HRKJ_CLI_DEBUG = true
}

const program = require('commander')
const loadCommand = require('../lib/util/loadCommand')

// 创建工程
program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  .action((name, cmd) => {
    require('../lib/create')(name, cleanArgs(cmd))
  })





// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function') {
      args[key] = cmd[key]
    }
  })
  return args
}
