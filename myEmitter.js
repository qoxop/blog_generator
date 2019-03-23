const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
MyEmitter.prototype.TYPE = {
    BEGIN_CREATE_ARTICLE_PAGE: 'begin_create_article_page',
    AFTER_PARSE_MD_TO_HTML: 'after_parse_md_to_html',
}
module.exports = new MyEmitter();