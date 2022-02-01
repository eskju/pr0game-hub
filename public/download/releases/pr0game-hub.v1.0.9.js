// ==UserScript==
// @name         pr0game Hub (aka hornyHub)
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  alliance hub using cloud
// @author       esKju <info@sq-webdesign.de>
// @match        https://pr0game.com/game.php?*
// @match        https://www.pr0game.com/game.php?*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @include      https://pr0game-hub.esKju.net/scripts/dist/script.js
// ==/UserScript==

$(function() {
    unsafeWindow.version = GM_getValue('version') || '1.0.1';
    unsafeWindow.apiKey = GM_getValue('api_key');
    unsafeWindow.debugMode = GM_getValue('debug_mode') === '1';
    unsafeWindow.developerMode = GM_getValue('developer_mode') === '1';
    unsafeWindow.apiUrl = developerMode ? 'http://pr0game-hub.local/' : 'https://pr0game-hub.esKju.net/';

    $('head').append('<link rel="stylesheet" href="' + apiUrl + 'skin.css">');
    $('body').append('<script type="text/javascript" src="' + apiUrl + 'scripts/dist/script.js?v=' + version + '"></script>');

    unsafeWindow.xmlhttpRequest = function(options) {
        return GM_xmlhttpRequest(options);
    };

    unsafeWindow.setValue = function(key, value) {
        return GM_setValue(key, value);
    };

    unsafeWindow.getValue = function(key) {
        return GM_getValue(key);
    };
});
