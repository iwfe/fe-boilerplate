/**
 * Created by zyy on 15/7/9.
 * zhangyuyu@superjia.com
 */
var supportPushState = 'pushState' in history,
    evt = supportPushState ? 'popstate' : 'hashchange';

var regexps = [
        /[\-{}\[\]+?.,\\\^$|#\s]/g,
        /\((.*?)\)/g,
        /(\(\?)?:\w+/g,
        /\*\w+/g,
    ],
    getRegExp = function(route) {
        route = route.replace(regexps[0], '\\$&')
            .replace(regexps[1], '(?:$1)?')
            .replace(regexps[2], function(match, optional) {
                return optional ? match : '([^/?]+)'
            }).replace(regexps[3], '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },
    extractParams = function(route, fragment) {
        var params = route.exec(fragment).slice(1);
        var results = [],
            i;
        for (i = 0; i < params.length; i++) {
            results.push(decodeURIComponent(params[i]) || null);
        }
        return results;
    };

function Router(opts) {
    var self = this;
    self.opts = opts;
    self.routes = opts.routes;
    self.root = opts.root || '';
    self.statefulClass = opts.statefulClass || 'stateful';
    self.search = location.search;
    self.hash = location.hash;
    self.parentNode = opts.parentNode || document;
    self.path = null;
    self.stateful();
}

Router.prototype = {
    exec: function(path) {
        var self = this;
        for (var r in this.routes) {
            var route = getRegExp(r);
            if (!route.test(path)) {
                continue;
            }
            if (typeof this.routes[r] === 'function') {
                this.routes[r].apply(this, extractParams(route, path));
            } else {
                var fn = this.opts[this.routes[r]];
                fn ? fn.apply(this, extractParams(route, path)) : void 0;
            }
        }
    },
    emit: function(evt) {
        var self = this,
            path = '';
        var root = self.root;
        var path = self.getPath();
        // var fullpath = (evt && evt.state && evt.state.path) || '/' + self.getPath();

        // if (root) {
        //     path = fullpath.replace(root, '');
        // }
        self.path = path;
        this.exec(path);
    },
    start: function() {
        var self = this;
        var opts = self.opts;
        self.go(self.getPath(), true);

        if (!supportPushState) return false;
        // var addEventListener = window.addEventListener || function(eventName, listener) {
        //     return attachEvent('on' + eventName, listener);
        // };

        window.addEventListener ? window.addEventListener(evt, function(path) {
            // Ignore extraneous popstate events in WebKit.
            if (path.state === undefined || path.state === null) {
                return
            }
            self.checkUrl();
        }, false) : window.attachEvent('on' + evt, function(path) {
            self.checkUrl();
        });
    },
    getPath: function() {
        var self = this;
        var path = location.pathname + location.search + location.hash; 
        return path.replace(self.root, '');
    },
    checkUrl: function() {
        var self = this;
        self.isSameFragment() || self.emit();
    },
    isSameFragment: function(path) {
        var self = this;
        var result = false;
        var currentPath = self.getPath();
        var path = path || currentPath;
        result = path == self.path;
        if(result) $.jps.trigger('router-same');
        return result;
    },
    // 未完成，先去掉
    // stop: function() {
    //     var self = this;
    //     if (!supportPushState) return false;
    //     window.removeEventListener ? window.removeEventListener(evt, function(path) {
    //         self.emit(path);
    //     }, false) : window.detachEvent('on' + evt, function(path) {
    //         self.emit(path);
    //     });

    //     // backbone源码部分
    //     //  var removeEventListener = window.removeEventListener || function(eventName, listener) {
    //     // return detachEvent('on' + eventName, listener);
    // },
    go: function(path, isReplace, removeSearch, removeHash, assign) {
        var self = this;
        if (self.isSameFragment(path)) return false;
        self.path = path;
        if (!supportPushState) {
            this.exec(path);
            return false;
        }
        var root = self.root;
        var fullpath = path;
        if (root) {
            fullpath = root + path
        }
        if (history.state && fullpath === history.state.path) {
            isReplace = true;
        }
        //支持?参数
        // if (fullpath.indexOf('?') == -1 && !removeSearch) {
        //     fullpath += self.search || '';
        // }

        //支持#参数
        // if (fullpath.indexOf('#') == -1 && !removeHash) {
        //     fullpath += self.hash || '';
        // }

        if (isReplace) {
            history.replaceState({
                path: fullpath
            }, document.title, fullpath);
        } else if (assign) {
            location.assign(fullpath);
        } else {
            history.pushState({
                path: fullpath
            }, document.title, fullpath);
        }
        this.exec(path);
    },

    getInfo: function(sperate) {
        var self = this;
        var result = (sperate == '?' ? location.search : location.hash);
        var href = self.href;
        if(!result && href && href.indexOf(sperate) !== -1) {
            result = href.substr(href.indexOf(sperate));
        }
        return result;
    },
    back: function() {
        history.back();
    },
    stateful: function() {
        var self = this;
        if (!$) return false;

        $(self.parentNode).on('click', '.' + self.statefulClass, function() {
            var item = $(this);
            var url = item.attr('href');
            var isFresh = item.data('isfresh');

            if (url) {
                if (isFresh)
                    window.location.href = url;
                else
                    self.go(url);
            }
            return false;
        });
    }
};

module.exports = Router;

//使用例子
/*var router = new Router({
    root: '/mock',
    routes: {
        '': function() {
            document.getElementById('out').innerHTML = 'You click mock';
        },
        '/': function() {
            document.getElementById('out').innerHTML = 'You click /';
        },

        '/todo': 'todo',
        '/start/:id': 'start',
        '/pages/p:page': 'page',
        '/files/*path': 'file',
        '/go': 'go'
    },

    todo: function() {
        document.getElementById('out').innerHTML = 'You click TODO';
    },
    start: function(id) {
        document.getElementById('out').innerHTML = 'You click identifier, identifier is <span style="color:red;">' + id + '</span>';
    },
    page: function(num) {
        document.getElementById('out').innerHTML = 'You click identifier, Page is <span style="color:red;">' + num + '</span>';
    },
    file: function(path) {
        document.getElementById('out').innerHTML = 'You click Path, path is <span style="color:red;">' + path + '</span>';
    },
    go: function() {
        router.go('/start/654321');
    }
});
router.start();*/
