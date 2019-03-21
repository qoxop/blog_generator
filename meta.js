const path = require('path')

const menus = [
    {text: 'HOME', url: '/index.html',  className: '', name: 'home' },
    {text: 'CATEGORY',  url: '/category.html', className: '', name: 'category' },
    {text: '标签', url: '/tags.html', className: '', name: 'tags' },
    {text: '链接', url: '/link.html', className: '', name: 'link'},
    {text: '关于我', url: '/about.html', className: '', name: 'about'}
]
const notePath = 'C:/work/myNotes';
const githubPagePath = 'C:/work/qoxop.github.io'

const INPUT_PATH = 'C:/work/myNotes';
const OUTPUT_PATH = path.join(__dirname, './site');
const REPO_PATH = 'C:/work/qoxop.github.io'
module.exports = {
    INPUT_PATH, OUTPUT_PATH, REPO_PATH
}