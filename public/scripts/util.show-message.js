window.showMessage = function (message, level) {
    let background;
    let color;

    switch (level) {
        case 'danger':
            background = '#161618';
            color = '#d23c22';
            break;

        default:
            background = '#161618';
            color = '#5cb85c';
            break;
    }

    $('#alertBox').remove();
    $('body').prepend('<div id="alertBox" style="padding: 25px 15px; background: ' + background + '; color: ' + color + '; z-index: 10000; position: fixed; top: 0; left: 0; right: 0; opacity: 0; text-align: center; font-weight: bold;">' + message + '</div>');
    $('#alertBox').animate({opacity: 1}, 250).animate({opacity: 1}, 2500).animate({opacity: 0}, 500, function () {
        $(this).remove();
    });
}
