window.PageHangar = function() {
    this.init = function() {
        this.convertHtml();
    };

    this.convertHtml = function() {
        $('content').addClass('hangar');

        $('.infos, .infoso').each(function(key, obj) {
            $(obj).addClass('hangar');
            $($(obj).find('div:nth-child(2)')).addClass('building-left');
            $($(obj).find('div:nth-child(3)')).addClass('building-right');
        });

        $('content').html($('content').html().replace(/Maximal baubare Einheiten:(.*)\<br\>/g, 'Maximal baubare Einheiten: $1'));
        $('content').html($('content').html().replace(/\(Stufe ([0-9]+)\)/g, '<br><span class="highlight">Stufe $1</span><br>'));
    };
};
