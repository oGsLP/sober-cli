#!/usr/bin/env node

const commander = require("commander");
const inquirer = require("inquirer");
const shell = require("shelljs");
const log = console.log;
const logger = require("tracer").colorConsole();
const presetUrl = "./preset/preset.sober";
const path = require("path");

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
    choices: ["crawler", "empty1", "empty2"],
    filter: val => val.toLowerCase()
  }
];

commander
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

commander.command("*").action(cmd => {
  logger.error(`Unknown command ${cmd}`);
});

commander.parse(process.argv);
