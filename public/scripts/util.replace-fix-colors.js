window.replaceFixColors = function() {
    $('content *[style]').each(function(key, obj) {
        if($(obj).attr('style').search(/color\:lime/) !== -1) {
            $(obj).attr('style', $(obj).attr('style').replace(/color\:lime/,''));
            $(obj).addClass('text-green');
        }

        if($(obj).attr('style').search(/color\:\#ffd600/) !== -1) {
            $(obj).attr('style', $(obj).attr('style').replace(/color\:\#ffd600/,''));
            $(obj).addClass('text-red');
        }

        if($(obj).attr('style').search(/color\:red/) !== -1) {
            $(obj).attr('style', $(obj).attr('style').replace(/color\:\#ffd600/,''));
            $(obj).addClass('text-red');
        }
    });
};
