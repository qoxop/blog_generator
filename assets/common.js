window.exec = (function() {
    const directHandlers = {
        'scrollToTop': function() {
            var main = document.getElementById('main');
            if (main && main.scrollIntoView) {
                main.scrollIntoView()
            }
        },
        'scrollToBottom': function() {
            var footer = document.getElementById('footer');
            if (footer && footer.scrollIntoView) {
                footer.scrollIntoView()
            }
        },
        'goback': function() {
            window.history.back()
        }
    }
    return function(direct, opts) {
        return directHandlers[direct](opts)
    }
})()
window.addEventListener('load', function() {
    function autoDisplayHeader() {
        const main = document.getElementById('main');
        const header = document.getElementById('app_header')
        let PreY = main.getBoundingClientRect().y;
        let dec = 0;
        window.onscroll = function(e) {
            if(dec === 0) {
                dec = setTimeout(() => {
                    dec = 0;
                    if(main.getBoundingClientRect().y - PreY < -5) {
                        header.classList.add('hide')
                        PreY = main.getBoundingClientRect().y;
                    }
                    if(main.getBoundingClientRect().y - PreY > 5) {
                        header.classList.remove('hide')
                        PreY = main.getBoundingClientRect().y;
                    }
                }, 50)
            }
        }
    }
    autoDisplayHeader()
})