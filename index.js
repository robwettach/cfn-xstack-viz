const AWS = require('aws-sdk');
const GraphViz = require('graphviz');

// The AWS SDK reads the default credentials file, but not the config file unless you tell it to
process.env.AWS_SDK_LOAD_CONFIG = true;
var cfn = new AWS.CloudFormation();
const g = GraphViz.digraph("G");

const DEFAULT_OPTIONS = {
  label: false,
  expand: false,
  include: false
};

function buildOptions(fileNameOrOptions) {
  let options;
  if (typeof fileNameOrOptions === 'string') {
    options = Object.assign({}, { ...DEFAULT_OPTIONS, output: fileNameOrOptions });
  }
  else {
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

  return [options, log];
}

module.exports = async function renderDependencies(fileNameOrOptions) {
  let [options, log] = buildOptions(fileNameOrOptions);

  if (options.include) {
    var stackNames = (await cfn.listStacks().promise()).StackSummaries.map(s => s.StackName);
    log(`Found ${stackNames.length} Stacks`);
    stackNames.forEach(n => g.addNode(n));
  }

  var exports = (await cfn.listExports().promise()).Exports.map(e => {
    return {
      stackName: e.ExportingStackId.split("/")[1],
      name: e.Name
    }
  });
  log(`Found ${exports.length} Exports`);

  await Promise.all(exports.map(async e => {
    try {
      var imports = (await cfn.listImports({ExportName: e.name}).promise()).Imports;
      log(`Found ${imports.length} Imports for ${e.name}`);
      imports.forEach(i => {
        addEdge(options, e, i);
      })
    } catch (ex) {
      // Ignore exceptions that an export isn't imported anywhere
      log(`No Imports for ${e.name}`);
      addEdge(options, e, "None");
    }
  }));

  if (g.edgeCount() > 0) {
    g.render("png", options.output);
    console.log(`Rendered stack dependencies to ${options.output}`);
  } else {
    console.log("No cross-stack dependencies found!");
  }
}

const KNOWN_EDGES = {}
function getEdge(g, nodeOne, nodeTwo) {
  const edgeKey = `${nodeOne}->${nodeTwo}`;
  const cachedEdge = KNOWN_EDGES[edgeKey];
  if (cachedEdge) {
    return cachedEdge;
  } else {
    const edge = g.edges.find(edge => edge.nodeOne.id === nodeOne && edge.nodeTwo.id === nodeTwo);
    if (edge) {
      KNOWN_EDGES[edgeKey] = edge;
    }
    return edge;
  }
}

function addEdge(options, exprt, imprt) {
  const edgeOptions = {};
  if (options.label) {
    edgeOptions.label = exprt.name;
  }
  let shouldAdd = true;
  if (!options.expand) {
    const existingEdge = getEdge(g, exprt.stackName, imprt);
    if (existingEdge) {
      const existingLabel = existingEdge.get("label");
      if (existingLabel && edgeOptions.label) {
        existingEdge.set("label", `${existingLabel}\n${edgeOptions.label}`);
      }
    }
    shouldAdd = !existingEdge;
  }
  if (shouldAdd) {
    g.addEdge(exprt.stackName, imprt, edgeOptions);
  }
}
