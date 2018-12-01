#!/usr/bin/env node
const renderDependencies = require('./index');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'output', alias: 'o', type: String, defaultOption: true }
]

let options = commandLineArgs(optionDefinitions);
renderDependencies(options)
  .catch(console.error);
