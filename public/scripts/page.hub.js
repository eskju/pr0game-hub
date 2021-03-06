window.PageHub = function () {
    const $this = this;
    this.container = $('content');
    this.init = function () {

    };

    this.loadPage = function (alias) {
        switch (alias) {
            case 'galaxyview':
                this.clearPage();
                this.loadGalaxyView();
                break;

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

            case 'score':
                this.clearPage();
                this.loadPageScore();
                break;

            case 'expos':
                this.clearPage();
                this.loadPageExpos();
                break;

            case 'galaxy':
                this.clearPage();
                this.loadPageGalaxy();
                break;

            case 'hostile-spying':
                this.clearPage();
                this.loadPageHostileSpying();
                break;

            case 'changelog':
                this.clearPage();
                this.loadPageChangelog();
                break;

            case 'alliance-power':
                this.clearPage();
                this.loadPageAlliancePower();
                break;

            default:
                alert('unknown page ' + alias);
        }
    };

    this.loadGalaxyView = function() {

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
        } else {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        return ((aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0) * invertSort;
    };

    this.loadPagePlanets = function () {
        getJSON('hub/planets', function (response) {
            if (response.status !== 200) {
                $this.container.html('<p style="color: ' + getRgb(cRed) + ';">Da Wing-Member h??ufiger die Allianz verlassen, sind Flotteninformationen etc. nur f??r die Main Allianz einsehbar.</p>');
            }

            let data = JSON.parse(response.responseText);
            const fn = $this.sortData;

            // sort player list
            data = data.sort(fn);

            let html = '';

            html += '<div class="infos text-left">';
            html += '<p style="padding-left: 10px"><i class="fa fa-info-circle"></i> <i>Halte die Maus ??ber die Buchstaben, um die Geb??udenamen zu sehen.</i></p>';
            html += '<table class="table519">';
            html += '<tr>';
            html += '<th class="sortable" colspan="3" data-sort="coordinates" data-direction="ASC">Koordinaten</th>';
            html += '<th class="sortable" style="text-align: left;" data-sort="name" data-direction="ASC">Spieler</th>';
            html += '<th class="sortable" style="text-align: left;" data-sort="score_building" data-direction="DESC">Punkte</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="metal_mine" data-direction="DESC" title="Metallmine">M</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="crystal_mine" data-direction="DESC" title="Kristallmine">K</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="deuterium_mine" data-direction="DESC" title="Deuteriumsynthetisierer">D</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="solar_plant" data-direction="DESC" title="Solarkraftwerk">S</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cPink) + '" data-sort="techno_dome" data-direction="DESC" title="Technodom">T</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="fusion_plant" data-direction="DESC" title="Fusionskraftwerk">F</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cBlue) + '" data-sort="robot_factory" data-direction="DESC" title="Roboterfabrik">R</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cBlue) + '" data-sort="nano_factory" data-direction="DESC" title="Nanofabrik">N</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cRed) + '" data-sort="hangar" data-direction="DESC" title="Raumschiffwerft">R</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="metal_storage" data-direction="DESC" title="Metallspeicher">M</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="crystal_storage" data-direction="DESC" title="Kristallspeicher">K</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cGreen) + '" data-sort="deuterium_storage" data-direction="DESC" title="Deuteriumtank">D</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cPink) + '" data-sort="laboratory" data-direction="DESC" title="Forschungslabor">F</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cBlue) + '" data-sort="terra_former" data-direction="DESC" title="Terraformer">T</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cRed) + '" data-sort="alliance_depot" data-direction="DESC" title="Allianzdepot">A</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cYellow) + '" data-sort="base" data-direction="DESC" title="Mondbasis">M</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cYellow) + '" data-sort="phalanx" data-direction="DESC" title="Phalanx">P</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cYellow) + '" data-sort="portal" data-direction="DESC" title="Sprungtor">S</th>';
            html += '<th class="sortable" style="text-align: right; color: ' + getRgb(cRed) + '" data-sort="missile_silo" data-direction="DESC" title="Raketensilo">R</th>';
            html += '</tr>';

            $.each(data, function (key, obj) {
                html += '<tr>';
                html += '<td style="text-align: right; width: 35px">' + obj.galaxy + '</td>';
                html += '<td style="text-align: right; width: 35px">' + obj.system + '</td>';
                html += '<td style="text-align: right; width: 35px">' + obj.planet + '</td>';
                html += '<td style="text-align: left;">' + obj.name + '</td>';
                html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.score_building || 0) / getMaxValue(data, 'score_building'), cRed) + '">' + numberFormat(obj.score_building || '') + '</td>';
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
            html += '</div>';

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
            let data = JSON.parse(response.responseText);
            const allianceId = getValue('filter_alliance_id') || '';

            let html = '';
            html += '<div class="infos text-left">';
            html += '<select style="margin-left: 10px" id="allianceIdSelect" onchange="setValue(\'filter_alliance_id\', this.value); pageHub.loadPageResearch()">';
            html += '<option value="">Alle</option>';
            html += '<option value="12"' + (allianceId === '12' ? ' selected' : '') + '>FELIDAE FERNICHTER</option>';
            html += '<option value="95"' + (allianceId === '95' ? ' selected' : '') + '>FELIDAE FERNICHTER WING</option>';
            html += '</select>';
            html += '<p style="padding-left: 10px"><i class="fa fa-info-circle"></i> <i>Halte die Maus ??ber die Buchstaben, um die Technologienamen zu sehen.</i></p>';
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
            html += '<th style="text-align: right;" title="Spionagetechnik">Spionagetechnik</th>';
            html += '<th style="text-align: right;" title="Computertechnik">Computertechnik</th>';
            html += '<th style="text-align: right;" title="Waffentechnik">Waffentechnik</th>';
            html += '<th style="text-align: right;" title="Schildtechnik">Schildtechnik</th>';
            html += '<th style="text-align: right;" title="Raumschiffpanzerung">Raumschiffpanzerung</th>';
            html += '<th style="text-align: right;" title="Energietechnik">Energietechnik-</th>';
            html += '<th style="text-align: right;" title="Hyperraumtechnik">Hyperraumtechnik</th>';
            html += '<th style="text-align: right;" title="Verbrennungstriebwerk">Verbrennungstriebwerk</th>';
            html += '<th style="text-align: right;" title="Impulstriebwerk">Impulstriebwerk</th>';
            html += '<th style="text-align: right;" title="Hyperraumantrieb">Hyperraumantrieb</th>';
            html += '<th style="text-align: right;" title="Lasertechnik">Lasertechnik</th>';
            html += '<th style="text-align: right;" title="Ionentechnik">Ionentechnik</th>';
            html += '<th style="text-align: right;" title="Plasmatechnik">Plasmatechnik</th>';
            html += '<th style="text-align: right;" title="Intergalaktisches Forschungsnetzwerk">Intergalaktisches Forschungsnetzwerk</th>';
            html += '<th style="text-align: right;" title="Astrophysik">Astrophysik</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Metall">Produktionsmaximierung Metall</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Kristall">Produktionsmaximierung Kristall</th>';
            html += '<th style="text-align: right;" title="Produktionsmaximierung Deuterium">Produktionsmaximierung Deuterium</th>';
            html += '<th style="text-align: right;" title="Gravitonforschung">Gravitonforschung</th>';
            html += '</tr>';

            $.each(data, function (key, obj) {
                if (allianceId === '' || parseInt(allianceId) === obj.alliance_id) {
                    html += '<tr>';
                    html += '<td style="text-align: left;">' + obj.name + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.score_science || 0) / getMaxValue(data, 'score_science'), cRed) + '">' + obj.score_science + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.spy_tech || 0) / getMaxValue(data, 'spy_tech'), cRed) + '">' + (obj.spy_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.computer_tech || 0) / getMaxValue(data, 'computer_tech'), cRed) + '">' + (obj.computer_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.military_tech || 0) / getMaxValue(data, 'military_tech'), cRed) + '">' + (obj.military_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.defense_tech || 0) / getMaxValue(data, 'defense_tech'), cRed) + '">' + (obj.defense_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.shield_tech || 0) / getMaxValue(data, 'shield_tech'), cRed) + '">' + (obj.shield_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.energy_tech || 0) / getMaxValue(data, 'energy_tech'), cRed) + '">' + (obj.energy_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.hyperspace_tech || 0) / getMaxValue(data, 'hyperspace_tech'), cRed) + '">' + (obj.hyperspace_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.combustion_tech || 0) / getMaxValue(data, 'combustion_tech'), cRed) + '">' + (obj.combustion_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.impulse_motor_tech || 0) / getMaxValue(data, 'impulse_motor_tech'), cRed) + '">' + (obj.impulse_motor_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.hyperspace_motor_tech || 0) / getMaxValue(data, 'hyperspace_motor_tech'), cRed) + '">' + (obj.hyperspace_motor_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.laser_tech || 0) / getMaxValue(data, 'laser_tech'), cRed) + '">' + (obj.laser_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.ion_tech || 0) / getMaxValue(data, 'ion_tech'), cRed) + '">' + (obj.ion_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.buster_tech || 0) / getMaxValue(data, 'buster_tech'), cRed) + '">' + (obj.buster_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.intergalactic_tech || 0) / getMaxValue(data, 'intergalactic_tech'), cRed) + '">' + (obj.intergalactic_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.expedition_tech || 0) / getMaxValue(data, 'expedition_tech'), cRed) + '">' + (obj.expedition_tech || '') + '</td>';
                    html += '<td style="background: rgba(255, 255, 255, 0.05) !important; text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.metal_proc_tech || 0) / getMaxValue(data, 'metal_proc_tech'), cRed) + '">' + (obj.metal_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.crystal_proc_tech || 0) / getMaxValue(data, 'crystal_proc_tech'), cRed) + '">' + (obj.crystal_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.deuterium_proc_tech || 0) / getMaxValue(data, 'deuterium_proc_tech'), cRed) + '">' + (obj.deuterium_proc_tech || '') + '</td>';
                    html += '<td style="text-align: right; color: ' + getColorAlt(cGreen, parseInt(obj.graviton_tech || 0) / getMaxValue(data, 'graviton_tech'), cRed) + '">' + (obj.graviton_tech || '') + '</td>';
                    html += '</tr>';
                }
            });

            html += '</table>';
            html += '</div>';

            $this.container.html(html);

            getJSON('hub/transfer-matrix', function (response) {
                data = JSON.parse(response.responseText);

                html = '';
                html += '<div class="infos text-left">';
                html += '<p style="margin-left: 10px"><b>Flotten-Transfers</b><br>Zeig an, ob der Sender (links) dem Empf??nger (rechts) Schiffe schicken darf.</p>';
                html += '<table class="table519">';
                html += '<tr>';
                html += '<th class="text-left">Send. / Empf.</th>';

                $.each(data, function (key, obj) {
                    if (allianceId === '' || parseInt(allianceId) === obj.alliance_id) {
                        html += '<th class="text-center" style="width: 75px"><div style="width: 75px; overflow: hidden; text-overflow: ellipsis">' + obj.name + '</div></th>';
                    }
                });

                html += '</tr>';
                $.each(data, function (key, sender) {
                    if (allianceId === '' || parseInt(allianceId) === sender.alliance_id) {
                        html += '<tr>';
                        html += '<td style="text-align: left;">' + sender.name + '</td>';
                        $.each(data, function (key, receiver) {
                            if (allianceId === '' || parseInt(allianceId) === receiver.alliance_id) {
                                if (sender.transfer_possible[receiver.id] === null) {
                                    html += '<td class="text-center" style="color: ' + getRgb(cGray) + '">---</td>';
                                } else {
                                    html += '<td class="text-center text-' + (sender.transfer_possible[receiver.id] ? 'green' : 'red') + '">' + (sender.transfer_possible[receiver.id] ? 'Ja' : 'Nein') + '</td>';
                                }
                            }
                        });
                        html += '</tr>';
                    }
                });

                html += '</table>';
                html += '</div>';

                $this.container.append(html);
            });
        });
    };

    this.loadPageFleet = function () {
        getJSON('hub/fleet', function (response) {
            const data = JSON.parse(response.responseText);
            let html = '';

            html += '<div class="infos text-left">';
            html += '<p style="padding-left: 10px"><i class="fa fa-info-circle"></i> <i>Halte die Maus ??ber die Buchstaben, um die Schiffsnamen zu sehen.</i></p>';
            html += '<table class="borderless">';
            html += '<tr>';
            html += '<th style="text-align: left;">Spieler</th>';
            html += '<th style="text-align: right">Punkte</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kleiner Transporter">KT</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Gro??er Transporter">GT</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Kolonieschiff">KS</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Recycler">Rec</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Spionagesonden">Spy</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cGreen) + '" title="Solar Satellit">Sat</th>';

            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Leichter J??ger">LJ</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Schwerer J??ger">SJ</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Kreuzer">Xer</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Schlachtschiff">SS</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Bomber">B</th>';
            html += '<th style="text-align: right; color: ' + getRgb(cRed) + '" title="Zerst??rer">Z</th>';
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
            html += '</div>';

            $this.container.html(html);
        });
    };

    this.loadPageScore = function () {
        $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
        getJSON('hub/scores', function (response) {
            response = JSON.parse(response.responseText);
            $this.container.html('<div class="infos text-left"><p style="padding-left: 10px"><i class="fa fa-info-circle"></i> <i>Relative Punkte??nderung in % pro Kalenderwoche</i></p><canvas id="scoreChart" style="height: 500px; width: 100%"></canvas></div>');

            const dates = response['dates'];
            let dataSets = [];
            let colors = ["#bce4d8", "#aedcd5", "#a1d5d2", "#95cecf", "#89c8cc", "#7ec1ca", "#72bac6", "#66b2c2", "#59acbe", "#4ba5ba", "#419eb6", "#3b96b2", "#358ead", "#3586a7", "#347ea1", "#32779b", "#316f96", "#2f6790", "#2d608a", "#2c5985"];

            for (let p = 0; p < response['data'].length; p++) {
                dataSets.push({
                    label: response['data'][p]['name'],
                    data: response['data'][p]['score_relative'],
                    backgroundColor: response['data'][p]['me'] ? '#ee4d2e' : colors[p % colors.length],
                    radius: 1
                });
            }

            const myChart = new Chart(
                document.getElementById('scoreChart'),
                {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: dataSets,
                    },
                }
            );

            $this.container.append('<div class="infos text-left"><p style="padding-left: 10px"><i class="fa fa-info-circle"></i> <i>Absolute Punkte??nderung pro Kalenderwoche</i></p><canvas id="scoreChart2" style="height: 500px; width: 100%"></canvas></div>');

            dataSets = [];

            for (let p = 0; p < response['data'].length; p++) {
                dataSets.push({
                    label: response['data'][p]['name'],
                    data: response['data'][p]['score_diff'],
                    backgroundColor: response['data'][p]['me'] ? '#ee4d2e' : colors[p % colors.length],
                    radius: 1
                });
            }

            const myChart2 = new Chart(
                document.getElementById('scoreChart2'),
                {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: dataSets,
                    },
                }
            );
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
            html += '<small class="text-left" style="display: block; color: ' + getRgb(cWhite) + '; padding-top: 10px; margin-top: 10px; border-top: 1px solid #222">F??r jedes System wird ein schmaler Balken abgebildet. Die Farbe ist gr??n, sofern das System erst k??rzlich angeschaut wurde und rot, wenn die letzte ??berpr??fung 7 Tage oder l??nger her ist. Das dargestellte System sowie Zeitpunkt der letzten Aktualisierung sind per Mouseover sichtbar.</small>';
            html += '</div>';

            $this.container.html(html);
        });
    };

    this.loadPageHostileSpying = function (page = 1) {
        let html = '';

        getJSON('hostile-spying?page=' + page, function (response) {
            response = JSON.parse(response.responseText);
            html += '<div class="infos text-left">';
            html += '<div class="text-center">';

            for (let p = 1; p <= response.last_page; p++) {
                html += '<a style="margin-right: 1px; background: #444; border-radius: 1px; padding: 4px; color: ' + getRgb(p === response.current_page ? cRed : cWhite) + '" href="javascript:void(0)" onclick="pageHub.loadPageHostileSpying(' + p + ')">' + p + '</a>';
            }

            html += '</div><br><table class="borderless">';
            html += '<tr>';
            html += '<th class="text-left">Allianz</th>';
            html += '<th class="text-left">Spion</th>';
            html += '<th class="text-left">Koords</th>';
            html += '<th class="text-left">Ziel</th>';
            html += '<th class="text-left">Ziel Koords</th>';
            html += '<th class="text-left">Zeitpunkt</th>';
            html += '</tr>';
            $.each(response.data, function (key, obj) {
                html += '<tr>';
                html += '<td class="text-left">' + (obj.attacker_alliance || '---') + '</td>';
                html += '<td class="text-left">' + (obj.attacker_name || '---') + '</td>';
                html += '<td class="text-left">' + obj.planet_start_coordinates + '</td>';
                html += '<td class="text-left">' + obj.target_name + '</td>';
                html += '<td class="text-left">' + obj.planet_target_coordinates + '</td>';
                html += '<td class="text-left">' + obj.timestamp + '</td>';
                html += '</tr>';
            });
            html += '</table>';
            html += '</div>';

            $this.container.html(html);
        });
    };

    this.loadPageAlliancePower = function () {
        let html = '';

        getJSON('hub/galaxy-alliances', function (response) {
            response = JSON.parse(response.responseText);
            html += '<div class="infos text-left">';
            html += '<table class="galaxy-power" cellspacing="0" cellpadding="0">';

            $.each(response, function (galaxy, galaxyData) {
                html += '<tr><th colspan="400" style="padding-top: 10px !important; padding-left: 0 !important;">Galaxie ' + galaxy + '</th></tr>';
                html += '<tr>';
                for (let i = 1; i <= 40; i++) {
                    html += '<th width="10" style="font-size: 8px; width: 10px; padding: 0 !important;" colspan="10">' + (i * 10 - 9) + '</th>';
                }
                html += '</tr>';

                $.each(galaxyData, function (planet, data) {
                    html += '<tr>';
                    $.each(data, function (system, obj) {
                        html += '<td class="galaxy-power" width="1" style="background: transparent; font-size: 10px; padding: 0;" title="' + system + ':' + planet + ': ' + (obj.name || '---') + ' (' + (obj.alliance || '---') + ')"><div style="box-shadow: 0 0 ' + Math.round(obj.power / 250) + 'px ' + Math.round(obj.power / 1250) + 'px ' + (obj.color || '#ffffff') + '; background-color: ' + (obj.color || 'rgba(255, 255, 255, 0.1)') + '"></div></td>';
                    });
                    html += '</tr>';
                });
            });

            html += '</table>';
            html += '</div>';

            $('head').append('<style>table.galaxy-powerx {border-collapse: collapse !important;} td.galaxy-power {outline: none !important; border: none !important; padding: 0 !important;}.galaxy-power > div {width: 7px !important; height: 7px !important;}</style>');

            $this.container.html(html);
        });
    };

    this.loadPageChangelog = function () {
        let html = '';

        html += '<div class="infos text-left">';
        html += '<table class="borderless">';
        html += '<tr>';
        html += '<th class="text-right" style="widtH: 75px">Version</th>';
        html += '<th class="text-left" style="width: 150px">DateTime</th>';
        html += '<th class="text-left">Changes</th>';
        html += '</tr>';

        $.each(changelog, function (key, obj) {
            html += '<tr>';
            html += '<td class="text-right" style="white-space: nowrap; color: ' + getRgb(version === obj.version ? cGreen : cWhite) + '">' + obj.version + '</td>';
            html += '<td class="text-left" style="white-space: nowrap; color: ' + getRgb(version === obj.version ? cGreen : cWhite) + '">' + obj.date_time + '</td>';
            html += '<td class="text-left" style="color: ' + getRgb(version === obj.version ? cGreen : cWhite) + '">' + obj.changes + '</td>';
            html += '</tr>';
        });

        html += '</table>';
        html += '<p class="text-center text-green" style="padding-top: 10px">coded with <i class="fa fa-heart text-red"></i> by eichhorn/esKju</p>';
        html += '</div>';

        $this.container.html(html);
    };
};
