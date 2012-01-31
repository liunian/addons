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
//jQuery(document).ready(function($){
    
    var chromeTabs = chrome.tabs,
        $window = $(window),
        $openTabs = $('#open-tabs'),
        $loadTabs = $('#load-tabs'),
        $loadHandler = $('#load-handler'),
        $loading = $('#loading'),
        $save = $('#save'),
        $load = $('#load'),
        hasLoad = false,
        hasStorage = false;
        
   
    
    
    // ui init
    $('#tabs').tabs({
        'event': 'mouseover'
    });
    
    $openTabs.selectable();
    $loadTabs.selectable();
    
    $('button').button();

    $loading.show();
    // ui init end ===========
    
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
    
    function notifyNotSignin() {
        
    }
    
    //
    // https://www.google.com/bookmarks/mark?q=&bkmk=http%3A%2F%2Fliunian.info%2F&prev=%2Flookup&start=0&cd=bkmk&sig=xcRq5coip1CiF2l0bzOoow&day=31&month=1&yr=2012&title=%E5%B0%8F%E5%B1%85&labels=test%2C+mark&annotation=some+test+note222
    function addNewBookmark(token, url, title, label, success, error) {
        var now = new Date();
            
        if (!token) {
            notifyNotSignin();
            return;
        }
        
        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: 'https://www.google.com/bookmarks/mark',
            data: {
                bkmk: url,
                title: title,
                labels: label.trim(),                
                prev: 'lookup',
                sig: token,
                yr: now.getFullYear(),
                month: now.getMonth(),
                day: now.getDate()  
            },
            success: function(response) {
                success && success(response);
            },
            error: function(err) {
                error && error(err);
            }
        })
    }
    
    function delBookmark(bookmarkId, callback) {
        
    }
    
    
    //// 显示当前窗口所有的 tab
    function showOpeningTabs() {
        chromeTabs.getAllInWindow(null, function (tabs) {
            var html = '';
            for (var i=tabs.length - 1; i >= 0; i--) {
                html = '<li class="ui-widget-content" data-url="' + tabs[i].url + '" title="' + tabs[i].title + '">' + tabs[i].title + '</li>' + html;
            }
            $openTabs.html(html);
        });
    }
    
    // 全选所有的标签页（用于保存或载入）
    $('.select-all').click(function(){
        var $this = $(this);
        
        $this.closest('.ui-tabs-panel').find('.ui-selectee').addClass('ui-selected');
    });
    
    
    // 保存
    // https://www.google.com/bookmarks/mark?q=&bkmk=http%3A%2F%2Fliunian.info%2F&prev=%2Flookup&start=0&cd=bkmk&sig=xcRq5coip1CiF2l0bzOoow&day=31&month=1&yr=2012&title=%E5%B0%8F%E5%B1%85&labels=test%2C+mark&annotation=some+test+note222
    /**
     * @param {array} bookmarks
     */
    function save(bookmarks) {
        var token = getToken();
        
        var successAdd = function(response) {
                bookmarks.slideUp();
            },
            errAdd = function(err) {
                console.log(err);
            };
            
        for (var i = 0, l = bookmarks.length; i < l; i++) {
            var item = bookmarks.eq(i);
            addNewBookmark(token, item.attr('data-url'), item.attr('title'), 'Sync My Tabs', successAdd, errAdd);
        };
    }
    
    
    // 加载最近 25 个 tab
    function loadLastTabs() {
        $.get('https://www.google.com/bookmarks/find?q=label%3A%22Sync%20My%20Tabs%22&output=rss&sort=date', function(rss){            
            var items = parseFeed(rss), html = ''; 
            for (var i = items.length - 1; i >= 0; i--) {
                html = '<li class="ui-widget-content" data-url="' + items[i].link + '" title="' + items[i].title + '" data-id="' + items[i].id + '">' + items[i].title + '</li>' + html;
            }
            hasLoad = true;
            $loading.hide();
            $loadTabs.html(html);
        });
    }
    
    function parseFeed(rss) {
        var res = [];
        
        $(rss).find('item').each(function(index){
            var item = {}, 
                $this = $(this);   window.item = $(this);
            
            item.link = $this.find('link').text();
            item.title = $this.find('title').text();
            item.id = $this.children().get(7).text();
            
            res.push(item);
        });
        
        return res;
    }
    
    // 加载已选的 tab
    function loadSelectTabs(tabs) {
        var src;
        for (var i = tabs.length - 1; i >= 0; i--) {
            src = tabs.eq(i).attr('data-url');
            
            //console.log(chromeTabs.query({url: src}, function(){}));
            //if (chromeTabs.query({url: src}, function(){})) continue;
            
            chromeTabs.create({
                url: src
            });
        }
    }
    
    // 删除已选
    function delSelectTabs(tabs) {
        
    }
    
    // when click save, save all selected
    $save.click(function(){
        var arrMarks = $openTabs.find('.ui-selected');
        
        save(arrMarks);
    })
    
    // when click load, load all selected
    $load.click(function(){
        var selected = $loadTabs.find('.ui-selected');
        
        loadSelectTabs(selected);
    });
    
    $loadHandler.on('mouseenter', function(e){
        if (hasLoad) return;
        loadLastTabs();
    });
    
    
    showOpeningTabs();
    // 这个不需要一开始就加载，以免拖慢打开速度
    //loadLastTabs();
    //// ===============================
    //// debug code
    
    //var tabs;
    
    //chrome.tabs.getAllInWindow(null, function (ts) {
    //   tabs = ts; 
    //});

    
    $window.bind('load', function(){
        setTimeout(function(){
            loadLastTabs();
        }, 1000);
    });
//});
    
    