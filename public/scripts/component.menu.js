window.Menu = function() {
    this.init = function() {
        let html = '';
        html += '<li><a style="color: #ee4d2e !important">pr0game Hub v' + version + '</a></li>';
        html += '<li data-hub-page="planets"><a href="javascript:void(0)"><i class="fa fa-globe-asia"></i> Planeten</a></li>';
        html += '<li data-hub-page="research"><a href="javascript:void(0)"><i class="fa fa-flask"></i> Forschung</a></li>';
        html += '<li data-hub-page="fleet"><a href="javascript:void(0)"><i class="fa fa-fighter-jet"></i> Flotte</a></li>';

        $('ul#menu').prepend(html);

        $('*[data-hub-page]').each(function(key, obj) {
            $(obj).click(function() {
                pageHub.loadPage($(obj).attr('data-hub-page'));
            });
        });

        let content;
        $('.res_max').each(function(key, obj) {
            content = $(obj).html();
            $(obj).html(content.replace('.000', 'K'));
        });
    };
};
