var IDS = {
    holder: 'img',
    input: 'msg'
};

var KEYS = {
    lf: 10,
    cr: 13
};

var extraCls = 'opacity75';

var textEle = document.getElementById(IDS.input),
    holder = document.getElementById(IDS.holder);

window.addEventListener('load', createQRCodeForCurTab, false);
textEle.addEventListener('keypress', pressInput, false);


function pressInput(e) {
    if (e.keyCode == KEYS.lf || e.keyCode == KEYS.cr) {
        var str = textEle.value;
        if (str.length) {
            updateQRCode(textEle.value);
        } else {
            createQRCodeForCurTab();
        }
    }
}

function createQRCodeForCurTab() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        if (tabs.length) {
            var url = tabs[0].url;
            textEle.value = url;
            createQRCode(url);
        }
    })
}

/**
 *
 * @param text {String}
 * @returns {QRCode}
 */
function createQRCode(text) {
    holder.innerHTML = '';
    holder.classList.add(extraCls);
    var qr = new QRCode(holder, {
        text        : text,
        width       : 256,
        height      : 256,
        colorDark   : "#000000",
        colorLight  : "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    holder.classList.remove(extraCls);

    return qr;
}

/**
 *
 * @param text {String}
 */
function updateQRCode(text) {
    createQRCode(text);
}