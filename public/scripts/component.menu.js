window.Menu = function() {
    this.init = function() {
        let html = '';
        html += '<li><a style="color: #ee4d2e !important; font-size: 11px">pr0game Hub v' + version + '</a></li>';
        html += '<li><a href="#hub.planets"><i class="fa fa-globe-asia"></i> Planeten</a></li>';
        html += '<li><a href="#hub.research"><i class="fa fa-flask"></i> Forschung</a></li>';
        html += '<li><a href="#hub.fleet"><i class="fa fa-fighter-jet"></i> Flotte</a></li>';
        html += '<li><a href="#hub.expos"><i class="fa fa-skull-crossbones"></i> Raids &amp; Expo</a></li>';
        html += '<li><a href="#hub.changelog"><i class="fa fa-history"></i> Changelog</a></li>';

        $('ul#menu').prepend(html);

        let content;
        $('.res_max').each(function(key, obj) {
            content = $(obj).html();
            $(obj).html(content.replace('.000', 'K'));
        });
    };
};
