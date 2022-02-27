window.PageFleet = function () {
    var $this = this;
    this.data = [];
    this.maxPoints = 2400;
    this.maxRessPoints = 2400;
    this.maxFleetPoints = 1250;
    this.fleet = [];

    this.init = function () {
        this.parseShips();
        this.showExpoButton();
        this.bindEnterKey();
    };

    this.parseShips = function () {
        const $this = this;
        let info;
        let globalFleet = [];

        $('.table519 tr').each(function (key, obj) {
            info = $(obj).html().replace(/\n/, '').match(/id\=\"ship([0-9]+)\_value\"\>([\.0-9]+)\</);

            if (info) {
                $this.fleet.push({
                    ship_id: getInt(info[1]),
                    amount: getInt(info[2])
                });

                globalFleet.push({
                    ship_id: getInt(info[1]),
                    amount: getInt(info[2])
                });
            }
        });

        let fleetInfo;
        let startPlanet;
        let ships;
        $('content > table:first-child > tbody > tr').each(function (key, obj) {
            if ($(obj).find('td').length > 1) {
                fleetInfo = $(obj).find('td:nth-child(3)').html();
                startPlanet = $(obj).find('td:nth-child(4)').html().match(/\[([0-9]+)\:([0-9]+)\:([0-9]+)\]/);

                ships = fleetInfo.match(/\'\>([^<]+)\:\<\/td\>\<td class\=\'transparent\'\>([\.0-9]+)\</g);

                if (ships && startPlanet[1] == ownGalaxy && startPlanet[2] == ownSystem && startPlanet[3] == ownPlanet) {
                    $.each(ships, function (sKey, sObj) {
                        info = sObj.match(/\'\>([^<]+)\:\<\/td\>\<td class\=\'transparent\'\>([\.0-9]+)\</);

                        if (info) {
                            globalFleet.push({
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
            fleet: globalFleet
        }, function (response) {
            $this.data = JSON.parse(response.responseText);

            let html = '<br><table class="table 519" style="max-width: 519px !important"><tr><th style="text-align: left">Schiffstyp</th><th style="text-align: right">Anzahl (planetübergreifend)</th><th style="text-align: right">Punkte</th><th style="text-align: right">Ben. Recs</th></tr>';
            $.each($this.data, function (key, obj) {
                html += '<tr>';
                html += '<td style="text-align: left">' + obj.name + '</td>';
                html += '<td style="text-align: right">' + numberFormat(obj.sum) + '</td>';
                html += '<td style="text-align: right">' + numberFormat(obj.score) + '</td>';
                html += '<td style="text-align: right">' + numberFormat(obj.recs) + '</td>';
                html += '</tr>';
            });

            $('content').append(html + '</table><p style="max-width: 519px !important; margin: 10px auto"><i>Diese Anzahl der stationierten und in der Luft befindlichen Schiffe (Aktiver Planet = Startplanet) wird aktualisiert, sobald die entsprechende Flottenseite des Planeten geöffnet wird.<br><br>Nach Kampf mit Verlust, werden die verlorenen Schiffe also erst nach Aufruf der Flottenansicht am Startplaneten aktualisiert. Nach Schiffsbau v.v.<br><br>Nach erfolgreicher Stationierung müssen somit die Flottenseiten von Start- und Zielplanet zur Aktualisierung geöffnet werden.</i></p>');
        });
    };

    this.showExpoButton = function () {
        $('.table519').each(function (key, obj) {
            if ($(obj).html().search(/Neuer Auftrag:/) !== -1) {
                $(obj).find('tr th').append('<span style="margin-left: 20px">Expo GT:</span> <a class="text-red" href="javascript:void(0)" onclick="pageFleet.setExpoFleet()">Ress</a> ');
                $(obj).find('tr th').append('<a class="text-red" href="javascript:void(0)" onclick="pageFleet.setExpoFleet(true)">Schiffe</a> // ');
                $(obj).find('tr th').append('Expo KT: <a class="text-red" href="javascript:void(0)" onclick="pageFleet.setExpoFleet(false, false)">Ress</a> ');
                $(obj).find('tr th').append('<a class="text-red" href="javascript:void(0)" onclick="pageFleet.setExpoFleet(true, false)">Schiffe</a>');
            }
        });
    }

    this.setExpoFleet = function (forFleetOnly = false, largeTransporters = true) {
        const notices = [];
        this.maxPoints = forFleetOnly ? this.maxFleetPoints : this.maxRessPoints;
        let pointsLeft = $this.maxPoints;
        let ship;
        const localFleet = JSON.parse(JSON.stringify(this.fleet));

        // set 1 spy drone
        ship = this.getShip(210);
        if (!ship || ship.amount === 0) {
            notices.push('Es ist keine Spionagesonde vorhanden!');
        } else {
            localFleet[ship.offset].used = (localFleet[ship.offset].used || 0) + 1;
            localFleet[ship.offset].amount--;
            pointsLeft = $this.subExpoPoints(pointsLeft, 210, 1);
        }

        // set 1 of the best ship
        const possibleBattleShipIds = [206, 207, 215, 211, 205, 204];
        let foundBestShip = false;
        $.each(possibleBattleShipIds, function (key, possibleShipId) {
            if (!foundBestShip) {
                ship = $this.getShip(possibleShipId);

                if (ship) {
                    pointsLeft = $this.subExpoPoints(pointsLeft, ship.ship_id, 1);
                    foundBestShip = true;

                    localFleet[ship.offset].used = (localFleet[ship.offset].used || 0) + 1;
                    localFleet[ship.offset].amount--;
                }
            }
        });

        // fill with transports and trash ships
        const fillers = largeTransporters ? [203, 202, 204, 205, 206, 207, 215, 211] : [202, 203, 204, 205, 206, 207, 215, 211];
        let pointsPerShip;
        let amount;
        $.each(fillers, function (key, possibleShipId) {
            ship = $this.getShip(possibleShipId);

            if (ship) {
                pointsPerShip = $this.getPointsPerShip(ship.ship_id);
                amount = Math.floor(pointsLeft / pointsPerShip);

                if (amount > localFleet[ship.offset].amount) {
                    amount = localFleet[ship.offset].amount;
                }

                pointsLeft = $this.subExpoPoints(pointsLeft, ship.ship_id, amount);

                localFleet[ship.offset].used = (localFleet[ship.offset].used || 0) + amount;
                localFleet[ship.offset].amount -= amount;
            }
        });

        // fill remaining points with spy drones
        ship = this.getShip(210);
        if (ship) {
            pointsPerShip = $this.getPointsPerShip(ship.ship_id);
            amount = Math.floor(pointsLeft / pointsPerShip);

            if (amount > localFleet[ship.offset].amount) {
                amount = localFleet[ship.offset].amount;
            }

            pointsLeft = $this.subExpoPoints(pointsLeft, ship.ship_id, amount);

            localFleet[ship.offset].used = (localFleet[ship.offset].used || 0) + amount;
            localFleet[ship.offset].amount -= amount;
        }

        // set input values
        let input;
        $.each(localFleet, function (key, obj) {
            input = $('#ship' + obj.ship_id + '_input');
            input.val(obj.used || 0);
            input.parent().css('text-align', 'left');
        });

        this.updatePoints();
    };

    this.updatePoints = function () {
        let points = 0;
        let shipPoints;
        let shipId;
        let textStyle;

        $('.table519').each(function (key, obj) {
            if ($(obj).html().search(/Neuer Auftrag:/) !== -1) {
                $($(obj).find('input')).each(function (key, field) {
                    if (field.outerHTML.search(/name\=/) !== -1) {
                        shipId = $(field).attr('name').replace(/ship/, '');
                        shipPoints = $this.getPointsPerShip(shipId) * getInt($(field).val());
                        points += shipPoints;

                        $(field).change(function () {
                            pageFleet.updatePoints();
                        });

                        $($(field).parent().parent().find('.helper')).remove();
                        $(field).parent().parent().append('<td class="helper text-right" style="margin-left: 10px; width: 200px">' + numberFormat(shipPoints) + ' Expo-Punkte</td>');
                    }
                });

                textStyle = $this.maxPoints !== points ? 'text-blue' : 'text-green';
                textStyle = $this.maxPoints > points ? 'text-red' : textStyle;
                $('.helper-headline').remove();
                $('.table519 tr:nth-child(2)').append('<td class="helper-headline text-right"><span class="' + textStyle + '">' + numberFormat(points) + '</span> / ' + numberFormat($this.maxPoints) + ' Expo-Punkte</td>');
            }
        });
    };

    this.getShip = function (offset) {
        for (i = 0; i < this.fleet.length; i++) {
            if (offset === this.fleet[i].ship_id) {
                this.fleet[i].offset = i;
                return this.fleet[i];
            }
        }

        return null;
    }

    this.getPointsPerShip = function (shipId) {
        const pointsMatrix = {
            202: 4,
            203: 12,
            204: 4,
            205: 10,
            206: 27,
            207: 60,
            208: 30,
            209: 16,
            210: 1,
            211: 75,
            213: 110,
            214: 9000,
            215: 70
        };

        return pointsMatrix[shipId] * 5;
    };

    this.subExpoPoints = function (pointsLeft, shipId, amount) {
        return pointsLeft - (this.getPointsPerShip(shipId) || 0) * (amount || 0);
    };

    this.bindEnterKey = function () {
        $(window).keyup(function (e) {
            if ($('content form').length === 1 && $('*:focus').length === 0) {
                if (e.key === 'Enter') {
                    $('content .table519 form').submit();
                }
            }
        });
    }
};
