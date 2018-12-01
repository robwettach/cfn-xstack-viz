const AWS = require('aws-sdk');
const GraphViz = require('graphviz');

// The AWS SDK reads the default credentials file, but not the config file unless you tell it to
process.env.AWS_SDK_LOAD_CONFIG = true;
var cfn = new AWS.CloudFormation();
var g = GraphViz.digraph("G");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const DEFAULT_OPTIONS = {
  label: false
};

module.exports = async function renderDependencies(fileNameOrOptions) {
  let options;
  if (typeof fileNameOrOptions === 'string') {
    options = Object.assign({}, {...DEFAULT_OPTIONS, output: fileNameOrOptions});
  } else {
    options = Object.assign({}, DEFAULT_OPTIONS, fileNameOrOptions);
  }
  if (!options.output) {
    throw "Output file name is required";
  }

  function log(str) {
    if (options.verbose) {
      console.log(str);
    }
  }

  var stackNames = (await cfn.listStacks().promise()).StackSummaries.map(s => s.StackName);
  log(`Found ${stackNames.length} Stacks`);
  stackNames.forEach(n => g.addNode(n));

  var exports = (await cfn.listExports().promise()).Exports.map(e => {
    return {
      stackName: e.ExportingStackId.split("/")[1],
      name: e.Name
    }
  });
  log(`Found ${exports.length} Exports`);

  await asyncForEach(exports, async e => {
    try {
      var imports = (await cfn.listImports({ExportName: e.name}).promise()).Imports;
      log(`Found ${imports.length} Imports for ${e.name}`);
      imports.forEach(i => {
        const edgeOptions = {};
        if (options.label) {
          edgeOptions.label = e.name;
        }
        g.addEdge(e.stackName, i, edgeOptions);
      })
    } catch (ex) {
      // Ignore exceptions that an export isn't imported anywhere
      log(`No Imports for ${e.name}`);
    }
  });

  if (g.edgeCount() > 0) {
    g.render("png", options.output);
    console.log(`Rendered stack dependencies to ${options.output}`);
  } else {
    console.log("No cross-stack dependencies found!");
  }
}