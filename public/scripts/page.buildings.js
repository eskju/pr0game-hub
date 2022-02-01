window.PageBuildings = function()
{
    const $this = this;
    this.data = [];

    this.convertHtml = function() {
        $('content').addClass('buildings');

        $('.infos, .infoso').each(function(key, obj) {
            $(obj).addClass('building');
            $($(obj).find('div:nth-child(2)')).addClass('building-left');
            $($(obj).find('div:nth-child(3)')).addClass('building-right');

            $this.disableButtons($($(obj).find('div:nth-child(3)')));
            $this.changeBuildTimeStyle($($(obj).find('div:nth-child(3)')));
        });

        $('content').html($('content').html().replace(/\(Stufe ([0-9]+)\)/g, '<br><span class="highlight">Stufe $1</span><br>'));
    };

    this.init = function() {
        const buildings = [];
        let info;
        let level;

        this.convertHtml();

        $('.buildn').each(function(key, obj) {
            info = $(obj).html().match(/\.info\(([0-9]+)\)\"\>([^<]+)\<\/a\>/);
            level = $(obj).html().match(/Stufe ([0-9]+)/);

            buildings.push({
                building_id: getInt(info[1]),
                level: level ? getInt(level[1]) : 0
            });
        });

        postJSON('planets/buildings', {
            coordinates: ownGalaxy + ':' + ownSystem + ':' + ownPlanet,
            buildings
        }, function(response) {
            $this.data = JSON.parse(response.responseText);

            $('.buildn').each(function(key, obj) {
                info = $(obj).html().match(/\.info\(([0-9]+)\)\"\>([^<]+)\<\/a\>/);
                $(obj).append('Max Stufe: ' + $this.data[info[1]].max_level);

                if($this.data[info[1]].max_level > 0) {
                    $(obj).append('<div class="player_names">' + $this.data[info[1]].player_names.replace(/,/g,', ') + '</div>');
                }
            });
        });
    };

    this.disableButtons = function(cell) {
        if($(cell).find('.text-red').length > 0) {
            $($(cell).find('.build_submit')).addClass('text-gray');
        }
    }

    this.changeBuildTimeStyle = function(cell) {
        $(cell).html($(cell).html().replace(/(.*)Bauzeit\:(.*)/,'$1<span class="text-gray">Bauzeit: $2</span>'));
    }
};
