# Sync My Tabs for Chrome

本插件来自 [keakon.net] 的 [Sync My Tabs] 的创意。

需先浏览器登录 [Google Bookmarks]。

[Google Bookmarks] 改版后，API发生了变化，原插件不能正常使用了，于是查看了一下网络请求，自己写了一个。

由于暂没两台电脑同时使用的情况，所以没有加上自动载入的功能。

为了能够继续使用原有标签的原因，继续使用了原有的 "Sync My Tabs" 标签，但由于没有自动载入功能，目前暂不使用 "Auto Load" 标签。

顺便也使用了原有的插件名：Sync My Tabs，但并没有放到 Chrome Web Store 上，仅自用。


  [keakon.net]: http://keakon.net
  [Sync My Tabs]: https://chrome.google.com/webstore/detail/eoallbnddbimmpfiodogdpndionkkjgb
  [Google Bookmarks]: https://www.google.com/bookmarks


##Update in 2012-03-05

移除删除功能，改为归档(archive)功能，即把原标签“Sync My Tabs“修改为“Sync My Tabs archive“。  

##Update in 2012-04-05

对标题和标签 title 做转义操作，解决原标签页标题带如 `<div>` 等标签造成的 bug

##update in 2012-05-04

因google页面代码变更而更改解析获取token的正则
