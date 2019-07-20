#!/usr/bin/env node

const program = require("commander");
const inquirer = require("inquirer");
// const shell = require("shelljs");
const log = console.log;
const logger = require("tracer").colorConsole();
const chalk = require("chalk");
// const presetUrl = "./preset/preset.sober";
// const path = require("path");

const didYouMean = require("didyoumean");
// Setting edit distance to 60% of the input string's length
didYouMean.threshold = 0.6;

// Config cli
program.version(require("./../package").version);
program.usage("<command> [options]");

// Cli options
program.option("-I, --info", "output cli tool info");
program.option("-A, --author", "output the author's info");

// Cli commands
const queries = [
  {
    type: "input",
    name: "name",
    message: "输入一个名字",
    filter: function(val) {
      return val;
    }
  },
  {
    type: "list",
    name: "func",
    message: "请选择使用的功能",
    choices: ["crawl", "checkin", "empty2"],
    filter: val => val.toLowerCase()
  }
];

program
  .command("start")
  .description("sober-cli")
  .action(() => {
    log("正在构建");
    inquirer.prompt(queries).then(answers => {
      const { name, func } = answers;
      log(name);
      log(func);
    });
  });

// Cmd sober list [functions...] (-a, --all)
program
  .command("list [functions...]")
  .description("list functions sober has done and supplied")
  .option("-f, --function-only", "list only supporting functions", {
    isDefault: true
  })
  .option("-a, --all", "list the all function's supporting kinds")
  .action(functions => {
    if (functions) {
      functions.forEach(f => {
        logger.info(f);
      });
    } else {
      logger.info("all");
    }
  });

program
  .command("crawl <kind> [args...]")
  .description("use sober-crawler to crawl sth")
  .option("-p, --preset-path <preset-path>")
  .option("-s, --save-path <save-path>")
  .action((kind, args, cmd) => {
    let argsObj = cleanArgs(cmd);
    log(argsObj);
    log(
      chalk.cyan(
        `Crawl ${chalk.magenta(kind)} infos with ${chalk.magenta(args)}`
      )
    );
  });

program
  .command("checkin <kind> [args...]")
  .description("use check-in to check in")
  .action((kind, args, cmd) => {
    let argsObj = cleanArgs(cmd);
    log(argsObj);
    log(
      chalk.cyan(
        `Crawl ${chalk.magenta(kind)} infos with ${chalk.magenta(args)}`
      )
    );
  });

// Cmd sober info
program
  .command("info")
  .description("print debugging information about your environment")
  .action(() => {
    log(chalk.bold("\nEnvironment Info:"));
    require("envinfo")
      .run(
        {
          System: ["OS", "CPU"],
          Binaries: ["Node", "Yarn", "npm"],
          Browsers: ["Chrome", "Edge", "Firefox", "Safari"],
          npmPackages: "/**/{*sober*,@sober/*/}",
          npmGlobalPackages: ["sober-cli"]
        },
        {
          showNotFound: true,
          duplicates: true,
          fullTree: true
        }
      )
      .then(log);
  });

// Handle unknown commands
program.command("*").action(cmd => {
  suggestCommand(cmd);
});

// Listen 'on' --help
program.on("--help", () => {
  log();
  log(
    `  Run ${chalk.underline.cyan.bold(
      `sober <command> --help`
    )} for detailed usage of given command.`
  );
  log();
});

program.commands.forEach(cmd => cmd.on("--help", () => console.log()));

program.parse(process.argv);

// Handle options
if (program.author) {
  log("author");
}

if (program.info) {
  log("info");
}

/**
 * Suggest command similar with unknown command user input
 *
 * @param cmd {String}
 * @api private
 */
function suggestCommand(cmd) {
  let suggestion = didYouMean(cmd, program.commands.map(cmd => cmd._name));
  if (suggestion) {
    log(
      `  ` +
        chalk.red(`Did you mean ${chalk.underline.yellow.bold(suggestion)} ?`)
    );
  } else {
    log(
      `  ` +
        chalk.yellow(`Unknown command ${chalk.underline.red.bold(cmd)}, `) +
        chalk.yellow(
          `plz run ${chalk.underline.green.bold("sober -h")} for help`
        )
    );
  }
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ""));

    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== "function" && typeof cmd[key] !== "undefined") {
      args[key] = cmd[key];
    }
  });
  return args;
}
