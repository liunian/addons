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
    function save() {
        
    }
    
    
    // 加载最近 25 个 tab
    function loadLastTabs() {
        $.getFeed({
            url: 'https://www.google.com/bookmarks/find?q=label%3A%22Sync%20My%20Tabs%22&output=rss&sort=date', 
            success: function(rss){
                var items = rss.items, html = '';
                for (var i = items.length - 1; i >= 0; i--) {
                    html = '<li class="ui-widget-content" data-url="' + items[i].link + '" title="' + items[i].title + '">' + items[i].title + '</li>' + html;
                }
                hasLoad = true;
                $loading.hide();
                $loadTabs.html(html);
            }
        });
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
    
    