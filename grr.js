(function (window) {

    var api = {
        container: document.createElement('div'),
        options: {
            life: 4000
        }
    };

    var toggleClass = function (element, className, onEnd) {
        if (className) {
            if (onEnd) {
                if (document.addEventListener) {
                    transitionEnd(element).bind(function () {
                        transitionEnd(element).unbind();
                        onEnd.call();
                    });
                } else {
                    onEnd.call();
                }
            }
            element.className = element.className.indexOf(className) > -1 ? element.className.replace(new RegExp('\\' + className + '\\b'), '').replace(/\s{2,}/, ' ') : element.className + (element.className ? ' ' : '') + className;
        }
    };

    var attach = function (parent) {
        api.container.style.position = 'absolute';
        api.container.style.top = '0';
        api.container.style.right = '0';
        toggleClass(api.container, 'grr-container');
        parent.appendChild(api.container);
    };

    var remove = function (item) {
        var timeout = item.getAttribute('data-timeout');
        if (timeout) {
            clearTimeout(item.getAttribute('data-timeout'));
        }
        toggleClass(item, 'grr-item-in');
        toggleClass(item, 'grr-item-out', function () {
            api.container.removeChild(item);
        });
    };

    var create = function (options) {
        var item = document.createElement('div');
        var textChild = document.createTextNode(options.msg);
        toggleClass(item, 'grr-item');
        item.appendChild(textChild);
        item.onclick = function () {
            remove(this);
        };
        return item;
    };

    var add = function (item) {
        api.container.appendChild(item);
        setTimeout(function () {
            toggleClass(item, 'grr-item-in');
        }, 50)
    };

    var raise = function (msg, sticky) {
        var item = create({msg: msg});
        add(item);
        if (sticky !== true) {
            item.setAttribute('data-timeout', setTimeout(function () {
                remove(item);
            }, api.options.life));
        }
        return item;
    };

    api.attach = attach;
    api.raise = raise;
    api.remove = remove;

    window.grr = api;

}).call(this, window);
