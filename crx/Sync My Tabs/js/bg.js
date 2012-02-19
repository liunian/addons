/**
 * 从 google bookmark 加载最近 25 个 label 是 "Sync My Tabs" 的书签，
 * 然后调用 parseFeed 函数来解析获取对象的书签对象，
 * 并将其以字符串的形式保存到 localStorage 的 lastTabs 中。
 */
function loadLastTabs() {
    if (localStorage.bookmarksToken == "undefined") return;
    $.get('https://www.google.com/bookmarks/find?q=label%3A%22Sync%20My%20Tabs%22&output=rss&sort=date', function(rss) {
        var items = parseFeed(rss),
            now = new Date().getTime();
        
        localStorage.updateTime = now;
        localStorage.lastTabs = JSON.stringify({
            'lastTime': now,
            'bookMarks': items
        });
    });
}


/**
 * 从获取到的rss中解析出对应的书签信息
 * @param {String} rss 从 google bookmark 中获取到的 bookmark rss
 *
 * @return 返回一个数组，数组成员是一个个书签对象，每个书签对象包括了 link, title 和 id
 */
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
    
setInterval(function(){
    loadLastTabs();
}, 60000);
