const fs = require('fs')
const path = require('path');
const { JSDOM } = require("jsdom");

function home(document) {
    // 添加 ul
    const article = document.querySelector('main>article');
    article.setAttribute('id', 'home_article_list')
    article.innerHTML = '<ul></ul>';
    // 添加yearbar
    const footer = document.querySelector('body>footer');
    const yearsbar = document.createElement('section');
    yearsbar.setAttribute('class', 'yearsbar');
    yearsbar.innerHTML = `<ul id="yearsbar"></ul>`;
    footer.insertBefore(yearsbar, document.querySelector('.copyright'));
}

function article(document, data) {
    // meta
    document.querySelector('meta[name="author"]').setAttribute('content', data.author);
    document.querySelector('meta[name="keywords"]').setAttribute('content', data.keywords.join(';'))
    document.querySelector('title').innerText = data.title;

    // find article
    const article = document.querySelector('main>article');
    article.setAttribute('id', 'article_main');

    // h1
    const h1 = document.createElement('h1');
    h1.innerText = data.title;

    // section.article_info
    const articleInfo = document.createElement('section');
    articleInfo.setAttribute('class', 'article_info');
    articleInfo.innerHTML = `
        <span class="author">author: ${data.author}</span>
        <span class="update_time">updateAt: ${data.updateTime}</span>
    `
    // div.from_markdown
    const fromMarkdown = document.createElement('div')
    fromMarkdown.setAttribute('class', 'from_markdown');
    fromMarkdown.innerHTML = data.html;

    // section.tags_bar
    const tagsBar = document.createElement('section');
    tagsBar.setAttribute('class', 'tags_bar');
    tagsBar.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');

    // apendChild
    article.appendChild(h1)
    article.appendChild(articleInfo)
    article.appendChild(fromMarkdown)
    article.appendChild(tagsBar)
    document.querySelector('meta[name="description"]').setAttribute('content', (document.querySelector('p') || {innerHTML: ''}).innerHTML);
}

function tags(document) {
    // 添加 section
    const article = document.querySelector('main>article');
    article.setAttribute('id', 'tags_article_list');
    article.innerHTML = `
        <section>
            <ul id="tags_list"></ul>
        </section>
        <section>
            <dl id="tag_article_list"></dl>
        </section>
    `
}
function about(document) {}

const handers = {
    home: { name: 'home', fn: home},
    tags: {name: 'tags', fn: tags},
    about: {name: 'about', fn: about},
    article: {name: 'article', fn: article}
}

function render(handler, data) {
    const tp = fs.readFileSync(path.join(__dirname, '../src/index.html'), {encoding: 'utf8'});
    const dom = new JSDOM(tp)
    const {document} = dom.window;
    const script = document.createElement('script');
    script.setAttribute('src', `/assets/script/${handler.name}.js`);
    document.body.appendChild(script);
    handler.fn(document, data)
    return dom.serialize().replace(/[\s, \n]+/g, ' ');
}
module.exports = {
    about: (data) => render(handers.about, data),
    article: data => render(handers.article, data),
    home: data => render(handers.home, data),
    tags: data => render(handers.tags, data)
}