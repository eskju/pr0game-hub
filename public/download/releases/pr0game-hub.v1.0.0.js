// ==UserScript==
// @name         pr0game Hub (aka hornyHub)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  alliance hub using cloud
// @author       esKju <info@sq-webdesign.de>
// @match        https://pr0game.com/game.php?*
// @match        https://www.pr0game.com/game.php?*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://pr0game-hub.esKju.net/scripts/dist/script.js
// ==/UserScript==

(function() {
    $('head').append('<link rel="stylesheet" href="https://pr0game-hub.esKju.net/skin.css">');
    $('body').append('<script src="https://pr0game-hub.esKju.net/scripts/dist/script.js?ts=' + new Date().getTime() + '"></script>');

    unsafeWindow.xmlhttpRequest = function(options) {
        return GM_xmlhttpRequest(options);
    };

    unsafeWindow.setValue = function(key, value) {
        return GM_setValue(key, value);
    };

    unsafeWindow.getValue = function(key) {
        return GM_getValue(key);
    };
})();
