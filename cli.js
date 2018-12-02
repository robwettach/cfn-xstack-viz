#!/usr/bin/env node
const renderDependencies = require('./index');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'output', alias: 'o', type: String, defaultOption: true },
  { name: 'label', alias: 'l', type: Boolean },
  { name: 'expand', alias: 'e', type: Boolean },
  { name: 'include', alias: 'i', type: Boolean }
]

let options = commandLineArgs(optionDefinitions);
renderDependencies(options)
  .catch(console.error);
