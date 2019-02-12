const { generateHtmlFiles, copyDirDeep } = require('./src/generate')
const {join} = require('path')

process.env.dev = false

generateHtmlFiles({
  inputPath: 'C:/work/notes',
  outputPath: join(__dirname, './site/'),
  baseUrl: ''
})
copyDirDeep(join(__dirname, './assets/'), join(__dirname, './site/assets/'))

