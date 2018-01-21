The Script TDTemplateGenerator.js takes a shape file in ShExJ format as input and gives a semantically enriched Thing Description template as output.

shex.js: https://www.npmjs.com/package/shex is used to convert a shape file from ShExC to ShExJ format. 
The following command converts from ShExC to ShExJ: ./node_modules/shex/bin/shex-to-json http://shex.io/examples/Issue.shex

The input file should be placed in iotschema\Shape Expressions directory.

The following commands generates a Thing Description template from a ShExJ file.

cd TD Template Generator
node TDTemplateGenerator.js
