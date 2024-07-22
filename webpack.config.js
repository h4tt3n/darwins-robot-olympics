// webpack.config.js
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: './src/simulations/simulation-04/main.js', // Your main JavaScript file
  output: {
    filename: 'bundle.js', // Output bundle file
    path: path.resolve(__dirname, 'dist-webpack'), // Output directory
  },
  mode: 'production', // 'development' | 'production'
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/, // Exclude node_modules directory
        use: {
          loader: 'babel-loader', // Use Babel to transpile JavaScript
          options: {
            presets: ['@babel/preset-env'], // Preset for modern JavaScript
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'], // Resolve JavaScript files
  },
  plugins: [
    new WebpackObfuscator({
      compact: true, // Reduce the size of the output code
      transformObjectKeys: true, // Transform object keys into expressions
      renameGlobals: true, // Rename all global identifiers to random names
      // controlFlowFlattening: true, // Enable control flow flattening
      // controlFlowFlatteningThreshold: 0.1, // Adjust the flattening threshold (0.75 is the default)
      // deadCodeInjection: true, // Injects dead code to make the code less readable
      // deadCodeInjectionThreshold: 0.2, // Adjust the dead code injection threshold (0.4 is the default)
      // stringArray: true, // Turn string literals into string arrays
      // stringArrayThreshold: 0.1, // Adjust the string array threshold (0.75 is the default)
      // stringArrayEncoding: ['rc4'], // Choose encoding for string arrays
      // rotateStringArray: true,
    }),
  ],
};
