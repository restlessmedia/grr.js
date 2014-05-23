(function (window) {

    var grr = {};

    (function (grr) {

        var Event = function (element, type) {
            this.element = element;
            this.type = type;
        };

        Event.prototype = {
            add: function (callback) {
                this.callback = callback;
                this.element.addEventListener(this.type, this.callback, false);
            },

            remove: function () {
                this.element.removeEventListener(this.type, this.callback, false);
            }
        };

        var TransitionEnd = function (element) {
            this.element = element;
            this.transitionEnd = this.whichTransitionEnd();
            this.event = new Event(this.element, this.transitionEnd);
        };

        TransitionEnd.prototype = {
            whichTransitionEnd: function () {
                var transitions = {
                    'WebkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd otransitionend',
                    'transition': 'transitionend'
                };

                for (var t in transitions) {
                    if (this.element.style[t] !== undefined) {
                        return transitions[t];
                    }
                }
            },

            bind: function (callback) {
                this.event.add(callback);
            },

            unbind: function () {
                this.event.remove();
            }
        };

        var Cache = {
            list: [],

            getPosition: function (element) {
                if (Array.prototype.indexOf) {
                    return this.list.indexOf(element);
                }

                for (var i = 0, size = this.list.length; i < size; i++) {
                    if (this.list[i] === element) {
                        return i;
                    }
                }

                return -1;
            },

            insert: function (element) {
                var positonElement = this.getPosition(element);
                var isCached = positonElement !== -1;

                if (!isCached) {
                    this.list.push(element);
                    this.list.push(new TransitionEnd(element));

                    positonElement = this.getPosition(element);
                }

                return this.list[positonElement + 1];
            }
        };

        grr.transitionEnd = function (el) {
            if (!el) {
                throw 'You need to pass an element as parameter!';
            }

            var element = el[0] || el;

            return Cache.insert(element);
        };
    }).call(this, grr);

    (function (window, grr) {

        var listeners = {};
        var api = {
            container: document.createElement('div'),
            options: {
                life: 4000
            }
        };

        var toggleClass = function (element, className, add, onEnd) {
            add = add !== false;
            if (className) {
                if (onEnd) {
                    if (document.addEventListener) {
                        grr.transitionEnd(element).bind(function () {
                            grr.transitionEnd(element).unbind();
                            onEnd.call();
                        });
                    } else {
                        onEnd.call();
                    }
                }
                if (add && element.className.indexOf(className) == -1) {
                    element.className = element.className + (element.className ? ' ' : '') + className;
                } else if (!add) {
                    element.className = element.className.replace(new RegExp('\\' + className + '\\b'), '').replace(/\s{2,}/, ' ');
                }
            }
        };

        var announce = function (type, args) {
            args = args || [];
            args.unshift(type);
            if (listeners[type]) {
                listeners[type].apply(api.container, args);
            }
        };

        var addListener = function (type, fn) {
            listeners[type] = fn;
        };

        var removeListener = function (type) {
            delete listeners[type];
        };

        var attach = function (parent) {
            api.container.style.position = 'absolute';
            api.container.style.top = '0';
            api.container.style.right = '0';
            toggleClass(api.container, 'grr-container');
            parent.appendChild(api.container);
        };

        var remove = function (item) {
            toggleClass(item, 'grr-item-in', false);
            toggleClass(item, 'grr-item-out', true, function () {
                api.container.removeChild(item);
                announce('removed', [item]);
            });
        };

        var create = function (options) {
            var item = document.createElement('div');
            var textChild = document.createTextNode(options.msg);
            toggleClass(item, 'grr-item');
            item.appendChild(textChild);
            item.onclick = function () {
                remove(this)
            };
            return item;
        };

        var add = function (item) {
            announce('added', [item]);
            api.container.appendChild(item);
            setTimeout(function () {
                toggleClass(item, 'grr-item-in');
            }, 50)
        };

        var raise = function (msg, sticky) {
            var item = create({msg: msg});
            add(item);
            if (sticky !== true) {
                setTimeout(function () {
                    remove(item);
                }, api.options.life);
            }
            return item;
        };

        api.attach = attach;
        api.raise = raise;
        api.remove = remove;
        api.addListener = addListener;
        api.removeListener = removeListener;

        window.grr = api;

    }).call(this, window, grr);
}).call(this, window);