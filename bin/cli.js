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

program
  .version(require('../package.json').version)
  .usage('<command> [options]')

// 创建工程
program
  .command('create <app-name>')
  .description('create a new project powered by hrkj-cli')
  .option('-f, --framework7', 'Create a framework7 project')
  .option('-v, --vue', 'Create a framework7-vue project')
  .option('-r, --react', 'Create a typescript react project')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('--typescript', 'Use TypeScript')
  .action((name, cmd) => {
    require('../lib/create')(name, cleanArgs(cmd))
  })

// output help information on unknown commands
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
  })

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`vue <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = (methodName, log) => {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }
    this.outputHelp()
    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

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
