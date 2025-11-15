module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add rule for CSV files
      webpackConfig.module.rules.push({
        test: /\.csv$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      });
      return webpackConfig;
    },
  },
};
