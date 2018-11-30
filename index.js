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

module.exports = async function renderDependencies(outFileName) {
  var stackNames = (await cfn.listStacks().promise()).StackSummaries.map(s => s.StackName);
  stackNames.forEach(n => g.addNode(n));

  var exports = (await cfn.listExports().promise()).Exports.map(e => {
    return {
      stackName: e.ExportingStackId.split("/")[1],
      name: e.Name
    }
  });

  await asyncForEach(exports, async e => {
    try {
      var imports = (await cfn.listImports({ExportName: e.name}).promise()).Imports;
      imports.forEach(i => {
        g.addEdge(e.stackName, i, {label: e.name});
      })
    } catch (ex) {
      // Ignore exceptions that an export isn't imported anywhere
    }
  });

  if (g.edgeCount > 0) {
    g.render("png", outFileName);
    console.log(`Rendered stack dependencies to ${outFileName}`);
  } else {
    console.log("No cross-stack dependencies found!");
  }
}