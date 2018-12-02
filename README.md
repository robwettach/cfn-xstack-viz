# CloudFormation Cross-Stack Dependency Visualization

Visualize Export/Import dependencies between your AWS CloudFormation stacks.

## Installation
This package requires that Graphviz is installed and on your `PATH`.
```
> brew install graphviz
> npm install -g cfn-xstack-viz
```

## Usage
This application reads your AWS credentials and region from your default AWS configuration files `~/.aws/credentials` and `~/.aws/config`.  Without those, it's useless.  The credentials must have at least `cloudformation:ListStacks`, `cloudformation:ListExports` and `cloudformation:ListImports` permissions.

Call the application from the command line passing the name of the file to write the output graph to:
```
> cfn-xstack-viz output.png
```

### Options
Just passing the output file name is sufficient for a basic graph, but extra options are available:

#### Output Filename (`--output`, `-v`)
The `output` option simply specifies the filename.  It's optional, as the filename may be specified without providing an option.

#### Edge Labels (`--label`, `-l`)
The `label` option labels the edges with the names of the Exports that connect the two Stacks.  If a pair of stacks are connected by multiple Exports, each Export name is listed on the edge between the two Stacks.  When used in combination with the `expand` option, each edge is labeled with a single Export name.

#### Expand Export Edges (`--expand`, `-e`)
The `expand` option causes each Export between two Stacks to render as an individual edge, rather than consolidating into a single edge.

#### Verbose Logging (`--verbose`, `-v`)
The `verbose` option enables extra debug logging.

#### Include All Stacks (`--include`, `-i`)
The `include` option causes all Stacks to be included in the output, even if they do not have any dependency relationships with other Stacks.  By default, Stacks that do not have dependency relationships with other Stacks are omitted.