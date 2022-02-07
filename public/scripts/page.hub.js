window.PageHub = function () {
    const $this = this;
    this.container = $('content');
    this.init = function () {

    };

    this.loadPage = function (alias) {
        switch (alias) {
            case 'planets':
                this.clearPage();
                this.loadPagePlanets();
                break;

            case 'research':
                this.clearPage();
                this.loadPageResearch();
                break;

            case 'fleet':
                this.clearPage();
                this.loadPageFleet();
                break;

            case 'expos':
                this.clearPage();
                this.loadPageExpos();
                break;

            case 'galaxy':
                this.clearPage();
                this.loadPageGalaxy();
                break;

            case 'changelog':
                this.clearPage();
                this.loadPageChangelog();
                break;

            default:
                alert('unknown page ' + alias);
        }
    };

    this.clearPage = function () {
        this.container.html('<i class="fa fa-spin fa-spinner"></i> Daten werden geladen.');
        this.container.addClass('hub');
    };

    this.sortData = function (a, b) {
        let property = getValue('hub_planets_orderBy') || 'coordinates';
        const invertSort = getValue('hub_planets_orderDirection') !== 'DESC' ? 1 : -1;

        const offsets = property.split('.');
        if (offsets.length === 2) {
            a = a[offsets[0]];
            b = b[offsets[0]];
            property = offsets[1];
        }

        let aVal = a[property] || '';
        let bVal = b[property] || '';

        if (property !== 'alliance_name' && property !== 'name') {
            aVal = getInt(aVal);
            bVal = getInt(bVal);
        }

        return ((aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0) * invertSort;
    };

    this.loadPagePlanets = function () {
        getJSON('hub/planets', function (response) {
            if (response.status !== 200) {
                $this.container.html('<p style="color: ' + getRgb(cRed) + ';">Da Wing-Member häufiger die Allianz verlassen, sind Flotteninformationen etc. nur für die Main Allianz einsehbar.</p>');
            }

            let data = JSON.parse(response.responseText);
            const fn = $this.sortData;

            // sort player list
            data = data.sort(fn);

            let html = '';

            html += '<p><i class="fa fa-info-circle"></i> <i>Halte die Maus über die Buchstaben, um die Gebäudenamen zu sehen.</i></p>';
            html += '<table class="table519">';
            html += '<tr>';
            html += '<th class="sortable" colspan="3" data-sort="coordinates" data-direction="ASC">Koordinaten</th>';
            html += '<th class="sortable" style="text-align: left;" data-sort="name" data-direction="ASC">Spieler</th>';
            html += '<th class="sortable" style="text-align: left;" data-sort="score_building" data-direction="DESC">Gebäudepunkte</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Metallmine">M</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kristallmine">K</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Deuteriumsynthetisierer">D</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Solarkraftwerk">S</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cPink) + '" title="Technodom">T</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Fusionskraftwerk">F</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cBlue) + '" title="Roboterfabrik">R</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cBlue) + '" title="Nanofabrik">N</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Raumschiffwerft">R</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Metallspeicher">M</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kristallspeicher">K</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Deuteriumtank">D</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cPink) + '" title="Forschungslabor">F</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cBlue) + '" title="Terraformer">T</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Allianzdepot">A</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cYellow) + '" title="Mondbasis">M</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cYellow) + '" title="Phalanx">P</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cYellow) + '" title="Sprungtor">S</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Raketensilo">R</th>';
            html += '</tr>';

            $.each(data, function (key, obj) {
                html += '<tr>';
                html += '<td style="text-align: right; width: 35px">' + obj.galaxy + '</td>';
                html += '<td style="text-align: right; width: 35px">' + obj.system + '</td>';
                html += '<td style="text-align: right; width: 35px">' + obj.planet + '</td>';
                html += '<td style="text-align: left;">' + obj.name + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.score_building || 0) / getMaxValue(data, 'score_building'), cRed) + '">' + (obj.score_building || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.metal_mine || 0) / getMaxValue(data, 'metal_mine'), cRed) + '">' + (obj.metal_mine || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.crystal_mine || 0) / getMaxValue(data, 'crystal_mine'), cRed) + '">' + (obj.crystal_mine || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.deuterium_mine || 0) / getMaxValue(data, 'deuterium_mine'), cRed) + '">' + (obj.deuterium_mine || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.solar_plant || 0) / getMaxValue(data, 'solar_plant'), cRed) + '">' + (obj.solar_plant || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.techno_dome || 0) / getMaxValue(data, 'techno_dome'), cRed) + '">' + (obj.techno_dome || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.fusion_plant || 0) / getMaxValue(data, 'fusion_plant'), cRed) + '">' + (obj.fusion_plant || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.robot_factory || 0) / getMaxValue(data, 'robot_factory'), cRed) + '">' + (obj.robot_factory || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.nano_factory || 0) / getMaxValue(data, 'nano_factory'), cRed) + '">' + (obj.nano_factory || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.hangar || 0) / getMaxValue(data, 'hangar'), cRed) + '">' + (obj.hangar || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.metal_storage || 0) / getMaxValue(data, 'metal_storage'), cRed) + '">' + (obj.metal_storage || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.crystal_storage || 0) / getMaxValue(data, 'crystal_storage'), cRed) + '">' + (obj.crystal_storage || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.deuterium_storage || 0) / getMaxValue(data, 'deuterium_storage'), cRed) + '">' + (obj.deuterium_storage || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.laboratory || 0) / getMaxValue(data, 'laboratory'), cRed) + '">' + (obj.laboratory || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.terra_former || 0) / getMaxValue(data, 'terra_former'), cRed) + '">' + (obj.terra_former || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.alliance_depot || 0) / getMaxValue(data, 'alliance_depot'), cRed) + '">' + (obj.alliance_depot || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.base || 0) / getMaxValue(data, 'base'), cRed) + '">' + (obj.base || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.phalanx || 0) / getMaxValue(data, 'phalanx'), cRed) + '">' + (obj.phalanx || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.portal || 0) / getMaxValue(data, 'portal'), cRed) + '">' + (obj.portal || '') + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.missile_silo || 0) / getMaxValue(data, 'missile_silo'), cRed) + '">' + (obj.missile_silo || '') + '</td>';
                html += '</tr>';
            });

            html += '</table>';

            $this.container.html(html);
            $('th.sortable').click(function () {
                if ($(this).attr('data-sort')) {
                    setValue('hub_planets_orderDirection', $(this).attr('data-direction'));
                    setValue('hub_planets_orderBy', $(this).attr('data-sort'));
                    $this.loadPagePlanets();
                }
            });

            $('th.sortable').each(function (key, obj) {
                $(obj).css('cursor', 'pointer');

                if ($(obj).attr('data-sort') == (getValue('hub_planets_orderBy') || 'coordinates') && $(obj).attr('data-direction') == (getValue('hub_planets_orderDirection') || 'ASC')) {
                    $(obj).prepend($(obj).attr('data-direction') === 'ASC' ? '<i class="fa fa-caret-up"></i> ' : '<i class="fa fa-caret-down"></i> ');
                    $(obj).css('white-space', 'nowrap');
                }
            });
        });
    };

    this.loadPageResearch = function () {
        getJSON('hub/research', function (response) {
            const data = JSON.parse(response.responseText);
            const allianceId = getValue('filter_alliance_id') || '';
            console.log(allianceId);

            let html = '';
            html += '<select id="allianceIdSelect" onchange="setValue(\'filter_alliance_id\', this.value); pageHub.loadPageResearch()">';
            html += '<option value="">Alle</option>';
            html += '<option value="12"' + (allianceId === '12' ? ' selected' : '') + '>FELIDAE FERNICHTER</option>';
            html += '<option value="95"' + (allianceId === '95' ? ' selected' : '') + '>FELIDAE FERNICHTER WING</option>';
            html += '</select>';
            html += '<p><i class="fa fa-info-circle"></i> <i>Halte die Maus über die Buchstaben, um die Technologienamen zu sehen.</i></p>';
            html += '<table class="table519">';
            html += '<tr>';
            html += '<td></td>';
            html += '<td></td>';
            html += '<td colspan="2"></td>';
            html += '<td colspan="3">Flottenwert</td>';
            html += '<td colspan="2">Technik</td>';
            html += '<td colspan="3">Triebwerk</td>';
            html += '<td colspan="3">Bewaffnung</td>';
            html += '<td colspan="2"></td>';
            html += '<td colspan="3">Produktion</td>';
            html += '<td></td>';
            html += '</tr>';
            html += '<tr>';
            html += '<th style="text-align: left;">Spieler</th>';
            html += '<th style="text-align: right;">Punkte</th>';
            html += '<th style="text-align: right;" title="Spionagetechnik">S</th>';
            html += '<th style="text-align: right;" title="Computertechnik">C</th>';
            html += '<th style="text-align: right;" title="Waffentechnik">W</th>';
            html += '<th style="text-align: right;" title="Raumschiffpanzerung">R</th>';
            html += '<th style="text-align: right;" title="Schildtechnik">S</th>';
            html += '<th style="text-align: right;" title="Energietechnik">E</th>';
            html += '<th style="text-align: right;" title="Hyperraumtechnik">H</th>';
            html += '<th style="text-align: right;" title="Verbrennungstriebwerk">V</th>';
            html += '<th style="text-align: right;" title="Impulstriebwerk">I</th>';
            html += '<th style="text-align: right;" title="Hyperraumantrieb">H</th>';
            html += '<th style="text-align: right;" title="Lasertechnik">L</th>';
            html += '<th style="text-align: right;" title="Ionentechnik">I</th>';
            html += '<th style="text-align: right;" title="Plasmatechnik">P</th>';
            html += '<th style="text-align: right;" title="Intergalaktisches Forschungsnetzwerk">I</th>';
            html += '<th style="text-align: right;" title="Astrophysik">A</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Metall">M</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Kristall">K</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Deuterium">D</th>';
            html += '<th style="text-align: right;" title="Gravitonforschung">G</th>';
            html += '</tr>';

            $.each(data, function (key, obj) {
                if (allianceId === '' || parseInt(allianceId) === obj.alliance_id) {
                    html += '<tr>';
                    html += '<td style="text-align: left;">' + obj.name + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.score_science || 0) / getMaxValue(data, 'score_science'), cRed) + '">' + obj.score_science + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.spy_tech || 0) / getMaxValue(data, 'spy_tech'), cRed) + '">' + (obj.spy_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.computer_tech || 0) / getMaxValue(data, 'computer_tech'), cRed) + '">' + (obj.computer_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.military_tech || 0) / getMaxValue(data, 'military_tech'), cRed) + '">' + (obj.military_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.shield_tech || 0) / getMaxValue(data, 'shield_tech'), cRed) + '">' + (obj.shield_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.defense_tech || 0) / getMaxValue(data, 'defense_tech'), cRed) + '">' + (obj.defense_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.energy_tech || 0) / getMaxValue(data, 'energy_tech'), cRed) + '">' + (obj.energy_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.hyperspace_tech || 0) / getMaxValue(data, 'hyperspace_tech'), cRed) + '">' + (obj.hyperspace_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.combustion_tech || 0) / getMaxValue(data, 'combustion_tech'), cRed) + '">' + (obj.combustion_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.impulse_motor_tech || 0) / getMaxValue(data, 'impulse_motor_tech'), cRed) + '">' + (obj.impulse_motor_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.hyperspace_motor_tech || 0) / getMaxValue(data, 'hyperspace_motor_tech'), cRed) + '">' + (obj.hyperspace_motor_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.laser_tech || 0) / getMaxValue(data, 'laser_tech'), cRed) + '">' + (obj.laser_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.ion_tech || 0) / getMaxValue(data, 'ion_tech'), cRed) + '">' + (obj.ion_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.buster_tech || 0) / getMaxValue(data, 'buster_tech'), cRed) + '">' + (obj.buster_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.intergalactic_tech || 0) / getMaxValue(data, 'intergalactic_tech'), cRed) + '">' + (obj.intergalactic_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.expedition_tech || 0) / getMaxValue(data, 'expedition_tech'), cRed) + '">' + (obj.expedition_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.metal_proc_tech || 0) / getMaxValue(data, 'metal_proc_tech'), cRed) + '">' + (obj.metal_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.crystal_proc_tech || 0) / getMaxValue(data, 'crystal_proc_tech'), cRed) + '">' + (obj.crystal_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.deuterium_proc_tech || 0) / getMaxValue(data, 'deuterium_proc_tech'), cRed) + '">' + (obj.deuterium_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.graviton_tech || 0) / getMaxValue(data, 'graviton_tech'), cRed) + '">' + (obj.graviton_tech || '') + '</td>';
                    html += '</tr>';
                }
            });

            html += '</table>';

            $this.container.html(html);
        });
    };

    this.loadPageFleet = function () {
        getJSON('hub/fleet', function (response) {
            const data = JSON.parse(response.responseText);
            let html = '';

            html += '<p><i class="fa fa-info-circle"></i> <i>Halte die Maus über die Buchstaben, um die Schiffsnamen zu sehen.</i></p>';
            html += '<table class="table519">';
            html += '<tr>';
            html += '<th style="text-align: left;">Spieler</th>';
            html += '<th style="text-align: right">Punkte</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kleiner Transporter">KT</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Großer Transporter">GT</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kolonieschiff">KS</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Recycler">Rec</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Spionagesonden">Spy</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Solar Satellit">Sat</th>';

            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Leichter Jäger">LJ</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Schwerer Jäger">SJ</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Kreuzer">Xer</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Schlachtschiff">SS</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Bomber">B</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Zerstörer">Z</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Todesstern">DS</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Schlachtkreuzer">SXer</th>';
            html += '</tr>';

            let style;
            $.each(data, function (key, obj) {
                style = obj.name === 'Gesamt' ? 'font-weight: bold; padding-top: 5px; border-top: 1px solid ' + getRgb(cRed) + '; color: ' + getRgb(cRed) : '';
                html += '<tr>';
                html += '<td style="text-align: left; ' + style + '">' + obj.name + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.score_military || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.small_transporters || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.large_transporters || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.coloy_ships || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.recyclers || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.spy_drones || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.solar_satellites || '') + '</td>';

                html += '<td style="text-align: right; ' + style + '">' + (obj.light_hunters || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.heavy_hunters || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.cruisers || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.battleships || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.bombers || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.destroyers || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.death_stars || '') + '</td>';
                html += '<td style="text-align: right; ' + style + '">' + (obj.battle_cruisers || '') + '</td>';
                html += '</tr>';
            });

            html += '</table>';

            $this.container.html(html);
        });
    };

    this.loadPageExpos = function () {
        let html = '';

        getJSON('flights/stats', function (response) {
            response = JSON.parse(response.responseText);

            html = '<div class="infos text-left">';
            html += '<table class="borderless" cellspacing="0">';
            html += '<tr>';
            html += '<tr><th colspan="7"><b>Eigene Statistik (gesamte Zeit)</b></th></tr>';
            html += '<th style="white-space: nowrap">Planet</th>';
            html += '<th style="white-space: nowrap" class="text-right">Letzte 24 Std</th>';
            html += '<th style="white-space: nowrap" class="text-right">Metall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Kristall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Deuterium</th>';
            html += '<th style="white-space: nowrap" class="text-right">Punkte</th>';
            html += '</tr>';

            $.each(response.own_stats, function (key, obj) {
                html += '<tr>';
                html += '<td style="white-space: nowrap" class="text-left">' + key + '</td>';
                html += '<td style="white-space: nowrap" class="text-right">' + obj.count_24 + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.metal_diff) + '">' + obj.metal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.crystal_diff) + '">' + obj.crystal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.deuterium_diff) + '">' + obj.deuterium_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.score_diff) + '">' + obj.score_diff + '</td>';
                html += '</tr>';
            });

            html += '</table>';
            html += '<small class="text-left" style="display: block; color: ' + getRgb(cRed) + '; padding-top: 10px; margin-top: 10px; border-top: 1px solid #222">Flottenbewegungen werden nur erfasst, wenn sowohl während Hin- als auch Rückflug die Übersicht mit diesem Plugin geöffnet wurde. Metall/Kristall/Deuterium/Punkte berechnen den Ressourcengewinn, sowie Schiffsgewinn und -verlust (Produktionskosten) mit ein. Komplettverluste (depleted/black hole) sowie Expo-Abbrüche werden <u>NICHT</u> erfasst.</small>';
            html += '</div>';

            html += '<div class="infos text-left">';
            html += '<table class="borderless" cellspacing="0">';
            html += '<tr>';
            html += '<tr><th colspan="7"><b>Expos (letzte 24 Std)</b></th></tr>';
            html += '<th style="white-space: nowrap">Planet</th>';
            html += '<th style="white-space: nowrap" class="text-right">Letzte 24 Std</th>';
            html += '<th style="white-space: nowrap" class="text-right">Metall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Kristall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Deuterium</th>';
            html += '<th style="white-space: nowrap" class="text-right">Punkte</th>';
            html += '</tr>';

            $.each(response.stats_per_player, function (key, obj) {
                html += '<tr>';
                html += '<td style="white-space: nowrap" class="text-left">' + obj.name + '</td>';
                html += '<td style="white-space: nowrap" class="text-right">' + obj.expeditions.count + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.expeditions.metal_diff) + '">' + obj.expeditions.metal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.expeditions.crystal_diff) + '">' + obj.expeditions.crystal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.expeditions.deuterium_diff) + '">' + obj.expeditions.deuterium_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.expeditions.score_diff) + '">' + obj.expeditions.score_diff + '</td>';
                html += '</tr>';
            });

            html += '</table>';
            html += '</div>';

            html += '<div class="infos text-left">';
            html += '<table class="borderless" cellspacing="0">';
            html += '<tr>';
            html += '<tr><th colspan="7"><b>Raids (letzte 24 Std)</b></th></tr>';
            html += '<th style="white-space: nowrap">Planet</th>';
            html += '<th style="white-space: nowrap" class="text-right">Gesamt</th>';
            html += '<th style="white-space: nowrap" class="text-right">Metall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Kristall</th>';
            html += '<th style="white-space: nowrap" class="text-right">Deuterium</th>';
            html += '<th style="white-space: nowrap" class="text-right">Punkte</th>';
            html += '</tr>';

            $.each(response.stats_per_player, function (key, obj) {
                html += '<tr>';
                html += '<td style="white-space: nowrap" class="text-left">' + obj.name + '</td>';
                html += '<td style="white-space: nowrap" class="text-right">' + obj.raids.count + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.raids.metal_diff) + '">' + obj.raids.metal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.raids.crystal_diff) + '">' + obj.raids.crystal_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.raids.deuterium_diff) + '">' + obj.raids.deuterium_diff + '</td>';
                html += '<td style="white-space: nowrap" class="text-right ' + getStyle(obj.raids.score_diff) + '">' + obj.raids.score_diff + '</td>';
                html += '</tr>';
            });

            html += '</table>';
            html += '</div>';

            $this.container.html(html);
        })
    };

    this.loadPageGalaxy = function () {
        let html = '';

        getJSON('hub/galaxy', function (response) {
            response = JSON.parse(response.responseText);

            html = '<div class="infos text-left">';
            html += '<table class="borderless" cellspacing="0">';
            html += '<tr>';
            html += '<th style="white-space: nowrap; width: 10%">Galaxie</th>';
            html += '<th style="white-space: nowrap" class="text-right">Systeme 1-400</th>';
            html += '</tr>';

            $.each(response, function (galaxy, data) {
                html += '<tr>';
                html += '<td style="white-space: nowrap" class="text-left">Galaxie ' + galaxy + '</td>';
                html += '<td style="white-space: nowrap" class="text-left">';
                html += '<div style="display: flex; width: 100%; justify-content: stretch">';
                $.each(data, function (system, obj) {
                    html += '<div title="System ' + system + ': ' + (obj.last_viewed_at || '---') + '" style="height: 25px; background: ' + getColorAlt([92, 184, 92], obj.intensity, [238, 77, 46]) + '; min-width: 1px; flex-grow: 1"></div>';
                });
                html += '</div>';
                html += '</td>';
                html += '</tr>';
            });

            html += '</table>';
            html += '<small class="text-left" style="display: block; color: ' + getRgb(cWhite) + '; padding-top: 10px; margin-top: 10px; border-top: 1px solid #222">Für jedes System wird ein schmaler Balken abgebildet. Die Farbe ist grün, sofern das System erst kürzlich angeschaut wurde und rot, wenn die letzte Überprüfung 7 Tage oder länger her ist. Das dargestellte System sowie Zeitpunkt der letzten Aktualisierung sind per Mouseover sichtbar.</small>';
            html += '</div>';

            $this.container.html(html);
        });
    };

    this.loadPageChangelog = function () {
        let html = '';

        const changelog = [
            {
                version: '1.0.24',
                date_time: '2022-02-07 11PM',
                changes: 'added spy report overview for galaxy view'
            },
            {
                version: '1.0.23',
                date_time: '2022-02-07 11PM',
                changes: 'added loading indicator for hub pages'
            },
            {
                version: '1.0.22',
                date_time: '2022-02-07 11PM',
                changes: 'added second sort item above coordinates in overview (sort by system)'
            },
            {
                version: '1.0.21',
                date_time: '2022-02-07 03PM',
                changes: 'changed defense score to planet\'s defense score (player\'s defense score in mouseover)'
            },
            {
                version: '1.0.20',
                date_time: '2022-02-07 06AM',
                changes: 'added alliance filter for hub\'s research page'
            },
            {
                version: '1.0.19',
                date_time: '2022-02-06 05PM',
                changes: 'added galaxy update check page'
            },
            {
                version: '1.0.18',
                date_time: '2022-02-06 03PM',
                changes: 'added link to rename/delete planet (overview)'
            },
            {
                version: '1.0.17',
                date_time: '2022-02-05 08AM',
                changes: 'added hub page for raids & expos'
            },
            {
                version: '1.0.16',
                date_time: '2022-02-04 08PM',
                changes: 'show fleet slot usage & expedition stats'
            },
            {
                version: '1.0.15',
                date_time: '2022-02-04 01PM',
                changes: 'show score differenz and details at flight overview'
            },
            {
                version: '1.0.14',
                date_time: '2022-02-04 09AM',
                changes: 'added fleet tracking and overview enhancement (show ship/res diffs)'
            },
            {
                version: '1.0.13',
                date_time: '2022-02-02 10PM',
                changes: 'added the black hole event for expeditions (for Sky/Mama) <3'
            },
            {
                version: '1.0.12',
                date_time: '2022-02-01 11PM',
                changes: 'made coordinates/player name/score in hub -> planets sortable'
            },
            {
                version: '1.0.11',
                date_time: '2022-02-01 11PM',
                changes: 'mark planet\'s production red, when storage limits are exceeded'
            },
            {
                version: '1.0.10',
                date_time: '2022-02-01 11PM',
                changes: 'added "observe" function for research (visible at overview)'
            },
            {
                version: '1.0.9',
                date_time: '2022-02-01 11PM',
                changes: 'added "observe" function for buildings (visible at overview)'
            },
            {version: '1.0.8', date_time: '2022-02-01 11AM', changes: 'added last attack/spy to galaxy view'},
            {
                version: '1.0.7',
                date_time: '2022-02-01 04AM',
                changes: 'added chart for alliance page (score development per member)'
            },
            {
                version: '1.0.6',
                date_time: '2022-02-01 03AM',
                changes: 'added own score as a reference to player score charts'
            },
            {
                version: '1.0.5',
                date_time: '2022-02-01 03AM',
                changes: 'changed button styles at buildings/research page when not affordable'
            },
            {version: '1.0.4', date_time: '2022-02-01 2AM', changes: 'added changelog page'},
            {
                version: '1.0.3',
                date_time: '2022-02-01 01AM',
                changes: 'added resources to overview (visit resource page at planets to update)'
            },
            {version: '1.0.2', date_time: '2022-02-01 01AM', changes: 'added "show_galaxy" setting'},
            {version: '1.0.1', date_time: '2022-01-31 06PM', changes: 'security bypasses / bugfix'},
            {version: '1.0.0', date_time: '2022-01-31 05PM', changes: 'stable release with auto updater'},
        ];

        html += '<table class="table519">';
        html += '<tr>';
        html += '<th class="text-right">Version</th>';
        html += '<th class="text-left">DateTime</th>';
        html += '<th class="text-left">Changes</th>';
        html += '</tr>';

        $.each(changelog, function (key, obj) {
            html += '<tr>';
            html += '<td class="text-right">' + obj.version + '</td>';
            html += '<td class="text-left">' + obj.date_time + '</td>';
            html += '<td class="text-left">' + obj.changes + '</td>';
            html += '</tr>';
        });

        html += '</table>';
        html += '<p class="text-center text-green" style="padding-top: 10px">coded with <i class="fa fa-heart text-red"></i> by eichhorn/esKju</p>';

        $this.container.html(html);
    };
};
