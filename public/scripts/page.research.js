window.PageResearch = function()
{
    this.data = [];

    this.convertHtml = function() {
        $('content').addClass('research');

        $('.infos, .infoso').each(function(key, obj) {
            $(obj).addClass('building');
            $($(obj).find('div:nth-child(2)')).addClass('building-left');
            $($(obj).find('div:nth-child(3)')).addClass('building-right');
        });

        $('content').html($('content').html().replace(/\(Stufe ([0-9]+)\)/g, '<br><span class="highlight">Stufe $1</span><br>'));
    };

    this.init = function() {
        const $this = this;
        const research = [];
        let info;
        let level;

        this.convertHtml();

        $('.buildn').each(function(key, obj) {
            info = $(obj).html().match(/\.info\(([0-9]+)\)\"\>([^<]+)\<\/a\>/);
            level = $(obj).html().match(/Stufe ([0-9]+)/);

            research.push({
                research_id: getInt(info[1]),
                level: level ? getInt(level[1]) : 0
            });
        });

        postJSON('players/research', {research}, function(response) {
            $this.data = JSON.parse(response.responseText);

            $('.buildn').each(function(key, obj) {
                info = $(obj).html().match(/\.info\(([0-9]+)\)\"\>([^<]+)\<\/a\>/);
                $(obj).append('Max: ' + $this.data[info[1]].max_level);

                if($this.data[info[1]].max_level > 0) {
                    $(obj).append('<div class="player_names">' + $this.data[info[1]].player_names.replace(/,/g,', ') + '</div>');
                }
            });
        });
    };
};
