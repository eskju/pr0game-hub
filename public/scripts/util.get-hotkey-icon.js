window.getHotkeyIcon = function(key, shift = false) {
    let html = '';

    if(shift) {
        html = getHotkeyIcon('<i class="fa fa-arrow-up"></i>');
    }

    return html + '<span style="width: 21px; outline: 1px solid ' + getRgb(cRed) + '; outline-offset: -1px; display: inline-block; font-size: 10px; line-height: 21px; text-align: center; margin-right: 5px; border-radius: 2px; background: ' + getRgb(cBlack) + '; color: ' + getRgb(cRed) + '">' + key + '</span>';
};
