var reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
};

var reduxExternal = {
  root: 'Redux',
  commonjs2: 'redux',
  commonjs: 'redux',
  amd: 'redux'
};

var reactReduxExternal = {
  root: 'ReactRedux',
  commonjs2: 'react-redux',
  commonjs: 'react-redux',
  amd: 'react-redux'
};

module.exports = {
  externals: {
    react: reactExternal,
    redux: reduxExternal,
    reactRedux: reactReduxExternal
  },
  entry: './lib/index.js',
  output: {
    path: './dist',
    filename: 'index.js',
    library: 'Relate',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: [
            ['transform-decorators-legacy']
          ]
        }
      }
    ]
  }
};
