# CloudFormation Cross-Stack Dependency Visualization

Visualize Export/Import dependencies between your AWS CloudFormation stacks.

## Installation
This package requires that Graphviz is installed and on your `PATH`.
```
> brew install graphviz
> npm install -g cfn-xstack-viz
```

## Usage
This application reads your AWS credentials and region from your default AWS configuration files `~/.aws/credentials` and `~/.aws.config`.  Without those, it's useless.  The credentials must have at least `cloudformation:ListStacks`, `cloudformation:ListExports` and `cloudformation:ListImports` permissions.

Call the application from the command line passing the name of the file to write the output graph to:
```
> cfn-xstack-viz output.png
```