/**
 * chrome tab structure example
 * {
 *    active: true
 *    favIconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAA2UlEQVQokWNgoBKQKlZ8pvRM4YZUMQ4FD7Nqbjo+c3hm8Ey+EauC/7z/qzZf8Hvm88zwGYakeLh4OIjurPZ+Fg40RdkKTUF+q+Yz5ZPK/abP/J5FPnN9dtoGTcGtEI8nDs/snnk/CwMqcH9mNAXD/ssHEh76Pwt8FgxUEvTM4pnybjE+VCWq/1efOnv67IHzUU+CngU8s3qmsRdNCVCRIRDaXj0Q+SQYaIr1M43TEtrYvKt6BarE7pn2LewhAlUSCDQFqwKYkoBn6y7gUAB29Pb/R/574VSADAB65m0TU5HokAAAAABJRU5ErkJggg=="
 *    highlighted: true
 *    id: 343
 *    incognito: false
 *    index: 0
 *    pinned: false
 *    selected: true
 *    status: "complete"
 *    title: "选项 - 扩展程序"
 *    url: "chrome://settings/extensions#"
 *    windowId: 408
 * }
 */
jQuery(document).ready(function($) {

    var chromeTabs = chrome.tabs,
        $window = $(window),
        $openTabs = $('#open-tabs'),
        $loadTabs = $('#load-tabs'),
        $loadHandler = $('#load-handler'),
        $loading = $('#loading'),
        $save = $('#save'),
        $load = $('#load'),
        $archive = $('#archive'),
        $loadAndDel = $('#loadAndDel'),
        $notify = $('#notify'),
        loading = false;


    // ui init
    $('#tabs').tabs({
        'event': 'mouseover'
    });

    $openTabs.selectable();
    $loadTabs.selectable();

    $('button').button();
    $notify.dialog({
        autoOpen: false,
        width: 350,
        position: 'center',
        show: 'slide',
        hide: 'slide'
    });

    // ui init end ===========


    // get token from localStorage
    var token = localStorage.bookmarksToken;


   //// 显示当前窗口所有的 tab
    function showOpeningTabs() {
        chromeTabs.getAllInWindow(null, function(tabs) {
            var html = '';
            for (var i = tabs.length - 1; i >= 0; i--) {
                var tmp = '', tab = tabs[i];
                tmp = '<li class="ui-widget-content ui-selectee';
                if (tab.active || tab.selected) tmp += ' ui-selected';
                tmp += '" data-url="' + tab.url
                    + '" title="' + tab.title + '">' + tab.title + '</li>';

                html = tmp + html;
            }
            $openTabs.html(html);
        });
    }


    function notifyNotSignin() {
        $notify.dialog('open');
    }


    //
    // urlModLabel = "/bookmarks/mark?op=modlabel&sig=
    function getToken() {
        var pattern = /bookmarks\/mark\?op=modlabel&sig=([^"]*)/,
            token;

        $.ajax({
            url: 'https://www.google.com/bookmarks/',
            async: false,
            dataType: 'text',
            type: 'GET',
            success: function(text) {
                var result = pattern.exec(text);
                if (result) token = result[1];
            }
        });

        return token;
    }


    //
    // https://www.google.com/bookmarks/mark?q=&bkmk=url&prev=%2Flookup&start=0&cd=bkmk&sig=token&day=31&month=1&yr=2012&title=title&labels=test&annotation=some
    function addNewBookmark(token, jQBookmark, label, success, error) {
        var now = new Date();

        if (!token || token == 'undefined') {
            notifyNotSignin();
            return;
        }

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: 'https://www.google.com/bookmarks/mark',
            data: {
                bkmk: jQBookmark.attr('data-url'),
                title: jQBookmark.attr('title'),
                labels: label,
                prev: '/lookup',
                sig: token,
                yr: now.getFullYear(),
                month: now.getMonth(),
                day: now.getDate()
            },
            success: function(response) {
                localStorage.updateTime = new Date().getTime();
                success && success.call(jQBookmark, response);
            },
            error: function(err) {
                error && error.call(jQBookmark, err);
            }
        });
    }


    // https://www.google.com/bookmarks/mark?dlq=书签Id&sig=签名字符串
    // 删除标签


    // 归档，实际还是使用 add 功能，但把标签替换掉，则会自动变更
    function archiveBookmark(token, jQBookmark, success, error) {
        addNewBookmark(token, jQBookmark, 'Sync My Tabs archive', success, error);
    }


    // 全选所有的标签页（用于保存或载入）
    $('.select-all').click(function() {
        var $this = $(this);

        $this.closest('.ui-tabs-panel').find('.ui-selectee')
            .addClass('ui-selected');
    });


    // 保存
    // https://www.google.com/bookmarks/mark?q=&bkmk=http%3A%2F%2Fliunian.info%2F&prev=%2Flookup&start=0&cd=bkmk&sig=xcRq5coip1CiF2l0bzOoow&day=31&month=1&yr=2012&title=%E5%B0%8F%E5%B1%85&labels=test%2C+mark&annotation=some+test+note222
    /**
     * @param {jQ array} bookmarks
     */
    function save(bookmarks) {
        var successAdd = function(response) {
                this.slideUp();
            },
            errAdd = function(err) {
                console.log(this, err);
            };

        bookmarks.each(function() {
            addNewBookmark(token, $(this), 'Sync My Tabs', successAdd, errAdd);
        });
    }

    /**
     * https://www.google.com/bookmarks/mark?dlq=书签Id&sig=签名字符串
     * @parm {jQ array} bookmarks
     */
    function archiveSelectTabs(bookmarks) {
        var token = getToken(),
            successDel = function() {
                this.slideUp();
            },
            errDel = function(err) {
                console.log(this. err);
            };

        bookmarks.each(function() {
            archiveBookmark(token, $(this), successDel, errDel);
        });
    }

    // 加载最近 25 个 tab
    function loadLastTabs(hasNoStorage) {
        if (!token || token == 'undefined') {
            notifyNotSignin();
            return;
        }

        loading = true;
        $loading.show();

        $.get('https://www.google.com/bookmarks/find?q=label%3A%22Sync%20My%20Tabs%22&output=rss&sort=date', function(rss) {
            var items = parseFeed(rss),
                now = new Date().getTime();

            loading = false;
            $loading.hide();

            localStorage.updateTime = now;
            localStorage.lastTabs = JSON.stringify({
                'lastTime': now,
                'bookMarks': items
            });

            if (hasNoStorage) {
                $loadTabs.html(buildLastTabs(items));
            }
        });
    }

    function buildLastTabs(items) {
        var html = '';
        for (var i = items.length - 1; i >= 0; i--) {
            html = '<li class="ui-widget-content ui-selectee" data-url="'
                + items[i].link + '" title="' + items[i].title
                + '" data-id="' + items[i].id + '">' + items[i].title
                + '</li>' + html;
        }
        return html;
    }

    function parseFeed(rss) {
        var res = [];

        $(rss).find('item').each(function(index) {
            var item = {},
                $this = $(this); window.item = $(this);

            item.link = $this.find('link').text();
            item.title = $this.find('title').text();
            // <smh:bkmk_id>xxxxxxx</smh:bkmk_id>
            // 此处使用了一种不严谨的获取方式，不判断前缀，因为没找到合适的方法
            item.id = $this.find('bkmk_id').text();

            res.push(item);
        });

        return res;
    }

    // 加载已选的 tab
    function openSelectTabs(tabs) {
        tabs.each(function() {
            var src = $(this).attr('data-url');
            chromeTabs.create({
                url: src
            });
        });
    }

    // when click save, save all selected
    $save.click(function() {
        var arrMarks = $openTabs.find('.ui-selected');

        save(arrMarks);
    });

    // when click load, load all selected
    $load.click(function() {
        var selected = $loadTabs.find('.ui-selected');

        openSelectTabs(selected);
    });

    $archive.click(function() {
        var selected = $loadTabs.find('.ui-selected');
        archiveSelectTabs(selected);
    });

    $loadAndDel.click(function() {
        var selected = $loadTabs.find('.ui-selected');
        openSelectTabs(selected);
        archiveSelectTabs(selected);
    });

    $loadHandler.on('mouseenter', function(e) {
        if (!localStorage.lastTabs ||
            JSON.parse(localStorage.lastTabs).lastTime != localStorage.updateTime) {
            if (loading) return;
            loadLastTabs(!localStorage.lastTabs);
        } else {
            $loadTabs.html(buildLastTabs(JSON.parse(localStorage.lastTabs).bookMarks));
        }
    });


    showOpeningTabs();

    $window.bind('load', function() {
        setTimeout(function() {
            if (!token || token == 'undefined') {
                localStorage.bookmarksToken = token = getToken();
            }
        }, 1000);
    });
});


