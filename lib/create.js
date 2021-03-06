const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const rimraf = require("rimraf");
const inquirer = require("inquirer");
// const Creator = require('./Creator')
const clearConsole = require("./util/clearConsole");
const {
  error,
  stopSpinner,
  logWithSpinner,
  log
} = require("@vue/cli-shared-utils");

async function create(projectName, options) {
  const inCurrent = projectName === ".";
  const name = inCurrent ? path.relative("../", process.cwd()) : projectName;
  const targetDir = path.resolve(projectName || ".");

  // check
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      rimraf.sync(targetDir);
    } else {
      await clearConsole();
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: "ok",
            type: "confirm",
            message: `Generate project in current directory?`
          }
        ]);
        if (!ok) {
          return;
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: "action",
            type: "list",
            message: `Target directory ${chalk.cyan(
              targetDir
            )} already exists. Pick an action:`,
            choices: [
              { name: "Overwrite", value: "overwrite" },
              { name: "Merge", value: "merge" },
              { name: "Cancel", value: false }
            ]
          }
        ]);
        if (!action) {
          return;
        } else if (action === "overwrite") {
          rimraf.sync(targetDir);
        }
      }
    }
  }

  // const promptModules = [
  //   'babel',
  //   'typescript',
  //   'pwa',
  //   'router',
  //   'vuex',
  //   'cssPreprocessors',
  //   'linter',
  //   'unit',
  //   'e2e'
  // ].map(file => require(`./promptModules/${file}`))

  // const creator = new Creator(name, targetDir, promptModules)
  // await creator.create(options)

  // request repo
  var download = require("download-git-repo");

  var loadTmpl = function(repoPath) {
    logWithSpinner(
      `✨`,
      `${chalk.yellow(`⚙  Installing... This might take a while...`)}`
    );

    download(repoPath, targetDir, function(err) {
      if (err) {
        console.log("err", err);
      } else {
        logWithSpinner(`🌞`, `${chalk.green(`⚙  Install Success!`)}`);
      }

      stopSpinner();
    });
  };

  // console.log(options)

  if (options.vue || (options.vue && options.framework7)) {
    loadTmpl("loves9/webapp-framework7");
  } 
  else if (options.react || (options.react && options.typescript)) {
    loadTmpl("loves9/webapp-react-ts");
  }
  else {
    loadTmpl("loves9/webapp");
  }
}

module.exports = (...args) => {
  create(...args).catch(err => {
    stopSpinner(false); // do not persist
    error(err);
    process.exit(1);
  });
};
