#!/usr/bin/env node
const renderDependencies = require('./index');

if (process.argv.length < 3) {
  console.log("Missing required parameter: output file name");
  process.exit(1);
} else {
  renderDependencies(process.argv[2]);
}