#!/usr/bin/env ts-node
import { program, Option } from 'commander'; // https://github.com/tj/commander.js#readme
import sqlite3 from 'sqlite3'; // https://github.com/TryGhost/node-sqlite3/wiki/API
import chalk from 'chalk'; // https://github.com/chalk/chalk#usage

var db_file = process.env.MISCBOX_DB || '../store.db';
var database : sqlite3.Database;

const getConnection = function() : sqlite3.Database {

    database = database || new sqlite3.Database(db_file);

    return database;

};

const calculate = function(serviceName : string, options : Object) : Promise<void> {

    if (!serviceName) {
        console.log(chalk.red('No name provided!'));
        return Promise.resolve();
    }

    let matches = serviceName.match(/[a-zA-Z]*/g);
    if (!matches) {
        console.log(chalk.red('Provided name has no letters!'));
        return Promise.resolve();
    }

    let store = !options.nostore && !options.anonymous;
    let db;
    if (!store) {
        console.log(chalk.yellow('Calculated port won\'t be saved.'));
    }
    else {
        db = getConnection();
    }

    let name = matches.join('').toLowerCase();
    let output = 0;

    for (let i = 0; i < name.length; i++) {
        output += (name.charCodeAt(i) - 'a'.charCodeAt(0)) * (i + 1);
    };

    let result = (output % 10000).toString();
    let prefix = '3'.padEnd(5 - result.length, '0');

    console.log('Calculated port number for '
              + chalk.cyan(serviceName)
              + (name !== serviceName ? chalk.dim(' (as ' + name + ')') : '')
              + ': '
              + chalk.green(prefix)
              + chalk.greenBright.bold(result));

    return Promise.resolve();
    
};

const remove = function() {

    console.log(chalk.redBright('Not yet implemented!'));

};

const list = function() {

    console.log(chalk.redBright('Not yet implemented!'));

};

program
    .command('calculate <service-name>')
    .aliases(['calc', 'get'])
    .description('Calculate a new port number for a Docker container with a given name')
    .addOption(new Option('--nostore, --anonymous', 'Use this flag to not use DB engine'))
    .action(calculate);

program
    .command('remove <service-name>')
    .aliases(['rm', 'delete', 'del'])
    .description('Remove stored Docker containers\' port numbers, allows filtering with a pattern')
    .addOption(new Option('--aspattern, --pattern', 'Use this flag to indicate using a pattern'))
    .action(remove);

program
    .command('list')
    .aliases(['ls', 'display'])
    .argument('[pattern]', 'Pattern to match services against')
    .description('List all previously calculated Docker containers\' port numbers, allows filtering with a pattern')
    .action(list);

program
    .version('1.0.0')
    .description('Set of tools related to calculating port numbers for Docker services/containers.');

program.parse();