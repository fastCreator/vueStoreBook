const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin')

module.exports = {
  stories: ['../stories/**/*.stories.(js|mdx)'],
  addons: [
    // https://github.com/storybookjs/storybook/tree/master/addons
    '@storybook/addon-actions', // 事件响应
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
  ]
}
