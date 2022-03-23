window.PageFleet = function () {
    var $this = this;
    this.data = [];
    this.maxPoints = 6000;
    this.maxRessPoints = 6000;
    this.maxFleetPoints = 3000;
    this.fleet = [];
    this.cargoOptions = [];

    this.init = function () {
        this.parseShips();
        this.showExpoButton();
        this.bindEnterKey();
        this.showCargoOptions();
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
        const possibleBattleShipIds = [207, 206, 215, 211, 205, 204];
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

    this.showCargoOptions = function () {
        let html = '';
        const planetResourceNotification = new PlanetResourceNotification();
        const metal = getInt(getValue(ownCoords[0] + '_metal'));
        const crystal = getInt(getValue(ownCoords[0] + '_crystal'));
        const deuterium = getInt(getValue(ownCoords[0] + '_deuterium'));
        const ktAvailable = getInt($('#ship202_value').html());
        const gtAvailable = getInt($('#ship203_value').html());

        this.cargoOptions = []
        this.cargoOptions.push({
            title: 'Ressourcen auf dem Planeten',
            metal,
            crystal,
            deuterium,
            setMetal: metal,
            setCrystal: crystal,
            setDeuterium: deuterium,
            coords: null
        });

        $.each(planetResourceNotification.getNotifications(), function (key, obj) {
            $this.cargoOptions.push({
                title: obj.coords + ' (' + obj.resource + ' Stufe ' + obj.level + ')',
                metal: getInt(obj.metal),
                crystal: getInt(obj.crystal),
                deuterium: getInt(obj.deuterium),
                setMetal: getInt(getInt(obj.metal) <= getInt(metal) ? obj.metal : metal),
                setCrystal: getInt(getInt(obj.crystal) <= getInt(crystal) ? obj.crystal : crystal),
                setDeuterium: getInt(getInt(obj.deuterium) <= getInt(deuterium) ? obj.deuterium : deuterium),
                coords: obj.coords
            });
        });

        html += '<br>';
        html += '<div id="customContentContainer">';
        html += '<table width="100%">'
        html += '<thead>';
        html += '<tr><th colspan="5">Cargo Options</th></tr>';
        html += '<tr>';
        html += '<th class="text-left">Preset</th>';
        html += '<th class="text-right">Metall</th>';
        html += '<th class="text-right">Kristall</th>';
        html += '<th class="text-right">Deuterium</th>';
        html += '<th class="text-right">ben. KT/GT</th>';
        html += '<th class="text-left">Optionen</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        $.each(this.cargoOptions, function (key, obj) {
            obj.sum = getInt(obj.setMetal) + getInt(obj.setCrystal) + getInt(obj.setDeuterium);
            obj.ktNeeded = Math.ceil((obj.sum + 1000) / 5000);
            obj.gtNeeded = Math.ceil((obj.sum + 1000) / 25000);

            html += '<tr>';
            html += '<td class="text-left">' + obj.title + '</td>'
            html += '<td class="text-right" style="color: ' + getRgb(obj.metal <= metal ? cGreen : cRed) + '">' + numberFormat(obj.metal) + '</td>'
            html += '<td class="text-right" style="color: ' + getRgb(obj.crystal <= crystal ? cGreen : cRed) + '">' + numberFormat(obj.crystal) + '</td>'
            html += '<td class="text-right" style="color: ' + getRgb(obj.deuterium <= deuterium ? cGreen : cRed) + '">' + numberFormat(obj.deuterium) + '</td>'
            html += '<td class="text-right"><span style="color: ' + getRgb(ktAvailable >= obj.ktNeeded ? cGreen : cRed) + '">' + numberFormat(obj.ktNeeded) + '</span> / <span style="color: ' + getRgb(gtAvailable >= obj.gtNeeded ? cGreen : cRed) + '">' + numberFormat(obj.gtNeeded) + '</span></td>'
            html += '<td class="text-left">';
            html += '<a href="javascript:void(0)" onclick="pageFleet.setCargoFleet(' + obj.setMetal + ', ' + obj.setCrystal + ', ' + obj.setDeuterium + ', 202, \'' + ownCoords[0] + '\', \'' + obj.coords + '\')" class="tooltip" style="font-weight: bold; color: ' + getRgb(ktAvailable === 0 ? cRed : (ktAvailable >= obj.ktNeeded ? cGreen : cYellow)) + '" data-tooltip-content="<b style=\'color:' + getRgb(cRed) + '\'>KT</b>s priorisieren: Erst die benötigten KT auswählen;<br>Falls nicht ausreichend vorhanden mit GTs auffüllen.<br>(+1.000 Ress für Treibstoff einkalkuliert).<br><span style=\'color: ' + getRgb(cGreen) + '\';>Genug KT vorhanden</span> / <span style=\'color: ' + getRgb(cYellow) + '\';>Mit GT-Auffüllung möglich</span> / <span style=\'color: ' + getRgb(cRed) + '\';>Keine KT vorhanden</span>"><i class="fa fa-truck-pickup"></i></a> / ';
            html += '<a href="javascript:void(0)" onclick="pageFleet.setCargoFleet(' + obj.setMetal + ', ' + obj.setCrystal + ', ' + obj.setDeuterium + ', 203, \'' + ownCoords[0] + '\', \'' + obj.coords + '\')" class="tooltip" style="font-weight: bold; color: ' + getRgb(gtAvailable === 0 ? cRed : (gtAvailable >= obj.gtNeeded ? cGreen : cYellow)) + '" data-tooltip-content="<b style=\'color:' + getRgb(cRed) + '\'>GT</b>s priorisieren: Erst die benötigten GT auswählen;<br>Falls nicht ausreichend vorhanden mit KTs auffüllen.<br>(+1.000 Ress für Treibstoff einkalkuliert).<br><span style=\'color: ' + getRgb(cGreen) + '\';>Genug GT vorhanden</span> / <span style=\'color: ' + getRgb(cYellow) + '\';>Mit KT-Auffüllung möglich</span> / <span style=\'color: ' + getRgb(cRed) + '\';>Keine GT vorhanden</span>"><i class="fa fa-truck"></i></a>';
            html += '</td>'
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';
        html += '</div><br>';

        $('content > br').replaceWith(html);
    };

    this.setCargoFleet = function (metal, crystal, deuterium, preset, departure, destination) {
        const ktAvailable = getInt($('#ship202_value').html());
        const gtAvailable = getInt($('#ship203_value').html());
        let sum = metal + crystal + deuterium + 1000;
        let sumKt = 0;
        let sumGt = 0;
        let asd;

        switch (preset) {
            case 202:
                asd = Math.ceil(sum / 5000);
                sumKt = asd > ktAvailable ? ktAvailable : asd;
                sum -= sumKt * 5000;

                if (sum > 0) {
                    asd = Math.ceil(sum / 25000);
                    sumGt = asd > gtAvailable ? gtAvailable : asd;
                }
                break;

            case 203:
                asd = Math.ceil(sum / 25000);
                sumGt = asd > gtAvailable ? gtAvailable : asd;
                sum -= sumGt * 25000;

                if (sum > 0) {
                    asd = Math.ceil(sum / 5000);
                    sumKt = asd > ktAvailable ? ktAvailable : asd;
                }
                break;
        }

        setValue(departure + '_fleet_metal', metal);
        setValue(departure + '_fleet_crystal', crystal);
        setValue(departure + '_fleet_deuterium', deuterium);
        setValue(departure + '_fleet_destination', destination);

        $('#ship202_input').val(sumKt);
        $('#ship203_input').val(sumGt);
    }
};
