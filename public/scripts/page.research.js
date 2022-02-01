window.PageResearch = function()
{
    const $this = this;
    this.data = [];

    this.convertHtml = function() {
        $('content').addClass('research');

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

    this.disableButtons = function (cell) {
        if ($(cell).find('.text-red').length > 0) {
            $($(cell).find('.build_submit')).addClass('text-gray');
            $(cell).parent().addClass('fade-' + ($(cell).find('.build_submit').length === 0 ? '25' : '75'));

            let buildingRight = $($(cell).parent().find('.building-right'));
            let ressList = $(buildingRight.find('> span:first-child')).html();
            let coords = ownGalaxy + ':' + ownSystem + ':' + ownPlanet;
            let resourceId = $($(cell).parent().find('.buildn > a')).attr('onclick').match(/\(([0-9]+)\)/)[1];

            let metal = $this.getCost('Metall', ressList);
            let crystal = $this.getCost('Kristall', ressList);
            let deuterium = $this.getCost('Deuterium', ressList);

            // show notification button
            if (new PlanetResourceNotification().hasNotification(coords, resourceId)) {
                const timestamp = new PlanetResourceNotification().getFinishTime(coords);
                buildingRight.append('<br><button onclick="(new PlanetResourceNotification().removeNotification(\'' + coords + '\'))" style="color: ' + getRgb(cRed) + '"><i class="fa fa-bell-slash"></i> baubar in <span class="notification-timer" data-timestamp="' + timestamp + '">' + formatTimeDiff(timestamp) + '</span></button>');
            } else {
                buildingRight.append('<br><button onclick="(new PlanetResourceNotification().addNotification(\'' + coords + '\', \'' + resourceId + '\',' + metal + ',' + crystal + ',' + deuterium + '))" style="color: ' + getRgb(cGreen) + '"><i class="fa fa-bell"></i> benachrichtigen, wenn baubar</button>');
            }
        }

        window.setInterval(function () {
            $('.notification-timer').each(function () {
                $(this).text(formatTimeDiff($(this).attr('data-timestamp')));
            });
        }, 1000);
    }

    this.changeBuildTimeStyle = function(cell) {
        $(cell).html($(cell).html().replace(/(.*)Bauzeit\:(.*)/,'$1<span class="text-gray">Bauzeit: $2</span>'));
    }

    this.getCost = function (label, html) {
        let tmp;

        switch (label) {
            case 'Metall':
                tmp = html.match(/\<a (.*)\>(Metall)\<\/a\>(.*)\<b(.*)\<span(.*)\>([.0-9]+)\<\//);
                break;

            case 'Kristall':
                tmp = html.match(/\<a (.*)\>(Kristall)\<\/a\>(.*)\<b(.*)\<span(.*)\>([.0-9]+)\<\//);
                break;

            case 'Deuterium':
                tmp = html.match(/\<a (.*)\>(Deuterium)\<\/a\>(.*)\<b(.*)\<span(.*)\>([.0-9]+)\<\//);
                break;
        }

        return tmp ? getInt(tmp[6]) : 0;
    }
};
