module.exports = {
  stories: ['../stories/**/*.stories.(js|mdx)'],
  babel: async function (config) {
    config.plugins.push(
      require.resolve('@babel/plugin-transform-modules-commonjs')
    )
    return config
  },
  addons: [
    // https://github.com/storybookjs/storybook/tree/master/addons
    // '@storybook/addon-actions', // 事件响应
    '@storybook/addon-links', // 链接跳转
    '@storybook/addon-knobs', // 参数联动
    '@storybook/addon-docs/register', // 文档
    '@storybook/addon-backgrounds/register', // 背景色
    '@storybook/addon-viewport/register', // 视图  /viewport
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null
      }
    }
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.less$/,
      loaders: [
        'style-loader',
        'css-loader',
        'less-loader'
      ]
    });
    return config;
  }
}
