window.PageFleet = function()
{
    this.data = [];

    this.init = function() {
        const $this = this;
        const fleet = [];
        let info;

        $('.table519 tr').each(function(key, obj) {
            info = $(obj).html().replace(/\n/,'').match(/id\=\"ship([0-9]+)\_value\"\>([\.0-9]+)\</);

            if(info) {
                fleet.push({
                    ship_id: getInt(info[1]),
                    amount: getInt(info[2])
                });
            }
        });

        let fleetInfo;
        let startPlanet;
        let ships;
        $('content > table:first-child > tbody > tr').each(function(key, obj) {
            if($(obj).find('td').length > 1) {
                fleetInfo = $(obj).find('td:nth-child(3)').html();
                startPlanet = $(obj).find('td:nth-child(4)').html().match(/\[([0-9]+)\:([0-9]+)\:([0-9]+)\]/);

                ships = fleetInfo.match(/\'\>([^<]+)\:\<\/td\>\<td class\=\'transparent\'\>([\.0-9]+)\</g);

                if(ships && startPlanet[1] == ownGalaxy && startPlanet[2] == ownSystem && startPlanet[3] == ownPlanet) {
                    $.each(ships, function(sKey, sObj) {
                        info = sObj.match(/\'\>([^<]+)\:\<\/td\>\<td class\=\'transparent\'\>([\.0-9]+)\</);

                        if(info) {
                            fleet.push({
                                ship_id: info[1],
                                amount: getInt(info[2])
                            });
                        }
                    });
                }
            }
        });

        postJSON('planets/fleet', {
            coordinates: ownGalaxy + ':' + ownSystem + ':' + ownPlanet,
            fleet
        }, function(response) {
            $this.data = JSON.parse(response.responseText);

            let html = '<br><table class="table 519" style="max-width: 519px !important"><tr><th style="text-align: left">Schiffstyp</th><th style="text-align: right">Anzahl (planetübergreifend)</th></tr>';
            $.each($this.data, function(key, obj) {
                html += '<tr><td style="text-align: left">' + obj.name + '</td><td style="text-align: right">' + obj.sum + '</td></tr>';
            });

            $('content').append(html + '</table><p style="max-width: 519px !important; margin: 10px auto"><i>Diese Anzahl der stationierten und in der Luft befindlichen Schiffe (Aktiver Planet = Startplanet) wird aktualisiert, sobald die entsprechende Flottenseite des Planeten geöffnet wird.<br><br>Nach Kampf mit Verlust, werden die verlorenen Schiffe also erst nach Aufruf der Flottenansicht am Startplaneten aktualisiert. Nach Schiffsbau v.v.<br><br>Nach erfolgreicher Stationierung müssen somit die Flottenseiten von Start- und Zielplanet zur Aktualisierung geöffnet werden.</i></p>');
        });
    };
};
