// == feature requests / ideas ==
// Klarname      add a simulator link to spy report history
// ???           exploration counter
// ???           exploration tracker/stats
// eichhorn      flying times in overview
// eichhorn      mileage in overview
// eichhorn      resource production in overview
// Klarname      show last spy, last attack, etc. in galaxy view
// Redstar       filter for coordinates (start / end)
// Redstar       colorize ally partners in green
// Redstar       colorize players from buddylist
// Redstar       option to switch galaxies dynamically

import './config.colors';
import './util.display-chart';
import './util.display-overview-settings';
import './util.display-overview-settings-highlight';
import './util.display-overview-settings-select';
import './util.display-overview-settings-range';
import './util.get-color';
import './util.get-color-alt';
import './util.get-color-intensity';
import './util.get-coordinates';
import './util.get-hotkey-icon';
import './util.get-int';
import './util.get-max-value';
import './util.get-player-attribute-style';
import './util.get-player-row-id-style';
import './util.get-player-row-style';
import './util.get-rgb';
import './util.replace-fix-colors';
import './util.save-ph-value';
import './util.show-message';
import './util.version-check';
import './xhr.get-json';
import './xhr.post-json';
import './component.menu';
import './page.alliance';
import './page.buildings';
import './page.fleet';
import './page.galaxy';
import './page.hangar';
import './page.hub';
import './page.messages';
import './page.overview';
import './page.playercard';
import './page.research';
import './page.stats';
import './queue.process';
import './queue.progressbar';

window.updateConfigVars = function () {
    cfgHighlight = {
        score: {
            enabled: (getValue('highlight_score_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_value') || '')
        },
        score_building: {
            enabled: (getValue('highlight_score_building_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_building_value') || '')
        },
        score_science: {
            enabled: (getValue('highlight_score_science_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_science_value') || '')
        },
        score_military: {
            enabled: (getValue('highlight_score_military_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_military_value') || '')
        },
        score_defense: {
            enabled: (getValue('highlight_score_defense_enable') || '0') === '1',
            threshold: getInt(getValue('highlight_score_defense_value') || '')
        }
    };

    filterInactive = getValue('filter_inactive') || 'ALL';
    filterNoobs = getValue('filter_noobs') || 'ALL';
    filterVacation = getValue('filter_vacation') || 'ALL';
    filterAlliance = getValue('filter_alliance') || 'ALL';
    filterSpyReport = getValue('filter_spy_report') || 'ALL';
    filterBattleReport = getValue('filter_last_battle_report') || 'ALL';
    filterScoreEnabled = getValue('filter_score_enable') || '0';
    filterScoreMin = getValue('filter_score_min') || '';
    filterScoreMax = getValue('filter_score_max') || '';
    filterScoreBuildingEnabled = getValue('filter_score_building_enable') || '0';
    filterScoreBuildingMin = getValue('filter_score_building_min') || '';
    filterScoreBuildingMax = getValue('filter_score_building_max') || '';
    filterScoreScienceEnabled = getValue('filter_score_science_enable') || '0';
    filterScoreScienceMin = getValue('filter_score_science_min') || '';
    filterScoreScienceMax = getValue('filter_score_science_max') || '';
    filterScoreFleetEnabled = getValue('filter_score_fleet_enable') || '0';
    filterScoreFleetMin = getValue('filter_score_fleet_min') || '';
    filterScoreFleetMax = getValue('filter_score_fleet_max') || '';
    filterScoreDefenseEnabled = getValue('filter_score_defense_enable') || '0';
    filterScoreDefenseMin = getValue('filter_score_defense_min') || '';
    filterScoreDefenseMax = getValue('filter_score_defense_max') || '';
    filterInactiveSinceEnabled = getValue('filter_inactive_since_enable') || '0';
    filterInactiveSinceMin = getValue('filter_inactive_since_min') || '';
    filterInactiveSinceMax = getValue('filter_inactive_since_max') || '';
    filterLastBattleReportEnabled = getValue('filter_last_battle_report_enable') || '0';
    filterLastBattleReportMin = getValue('filter_last_battle_report_min') || '';
    filterLastBattleReportMax = getValue('filter_last_battle_report_max') || '';
    filterLastSpyReportEnabled = getValue('filter_last_spy_report_enable') || '0';
    filterLastSpyReportMin = getValue('filter_last_spy_report_min') || '';
    filterLastSpyReportMax = getValue('filter_last_spy_report_max') || '';
    filterMetalEnabled = getValue('filter_metal_enable') || '0';
    filterMetalMin = getValue('filter_metal_min') || '';
    filterMetalMax = getValue('filter_metal_max') || '';
    filterCrystalEnabled = getValue('filter_crystal_enable') || '0';
    filterCrystalMin = getValue('filter_crystal_min') || '';
    filterCrystalMax = getValue('filter_crystal_max') || '';
    filterDeuteriumEnabled = getValue('filter_deuterium_enable') || '0';
    filterDeuteriumMin = getValue('filter_deuterium_min') || '';
    filterDeuteriumMax = getValue('filter_deuterium_max') || '';
}

window.getOverviewHeader = function () {
    let header = '<table cellspacing="0"><tr><td width="50%%" style="text-align: left; padding: 5px 10px">';
    header += '<a href="https://pr0game-hub.eskju.net/download/legend.png" target="_blank"><i class="fa fa-info-circle"></i> Legende</a>';
    header += ' // ';
    header += '<a href="https://pr0game-hub.eskju.net/download/faq.txt" target="_blank"><i class="fa fa-question-circle"></i> FAQ</a>';
    header += '</td>';

    if (getValue('hideSettings') === '1') {
        header += '<td id="showSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><i class="fa fa-cogs fa"></i> Einstellungen anzeigen</td>';
    } else {
        header += '<td id="hideSettings" style="text-align: right; padding: 5px 10px; cursor: pointer;"><span style="color: lightgreen"><i class="fa fa-cogs"></i> Einstellungen ausblenden</span></td>';
    }

    header += '</tr></table>';

    header += displayOverviewSettings();

    return header;
}

window.filterTableRow = function (obj, player) {
    // selects
    if (filterInactive === 'HIDE' && obj.player.is_inactive === 1) return false;
    if (filterInactive === 'ONLY' && obj.player.is_inactive === 0) return false;

    if (player !== null) {
        if (filterNoobs === 'HIDE' && obj.player.is_inactive === 0 && getInt(obj.player.score) < getInt(player.score) / 5) return false;
        if (filterNoobs === 'ONLY' && obj.player.is_inactive === 0 && getInt(obj.player.score) >= getInt(player.score) / 5) return false;
    }
    if (filterVacation === 'HIDE' && obj.player.on_vacation === 1) return false;
    if (filterVacation === 'ONLY' && obj.player.on_vacation === 0) return false;

    if (player) {
        if (filterAlliance === 'HIDE' && obj.player.alliance_id !== null && (obj.alliance_id === 12 || obj.alliance_id === 95)) return false;
        if (filterAlliance === 'ONLY' && (obj.player.alliance_id === null || (obj.alliance_id !== 12 && obj.alliance_id !== 95))) return false;
    }
    if (filterSpyReport === 'HIDE' && obj.last_spy_report !== '') return false;
    if (filterSpyReport === 'ONLY' && obj.last_spy_report === '') return false;
    if (filterBattleReport === 'HIDE' && obj.last_battle_report !== '') return false;
    if (filterBattleReport === 'ONLY' && obj.last_battle_report === '') return false;
    if (filterScoreEnabled === '1' && getInt(filterScoreMin) > 0 && getInt(filterScoreMin) > getInt(obj.player.score)) return false;
    if (filterScoreEnabled === '1' && getInt(filterScoreMax) > 0 && getInt(filterScoreMax) < getInt(obj.player.score)) return false;
    if (filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMin) > 0 && getInt(filterScoreBuildingMin) > getInt(obj.player.score_building)) return false;
    if (filterScoreBuildingEnabled === '1' && getInt(filterScoreBuildingMax) > 0 && getInt(filterScoreBuildingMax) < getInt(obj.player.score_building)) return false;
    if (filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMin) > 0 && getInt(filterScoreScienceMin) > getInt(obj.player.score_science)) return false;
    if (filterScoreScienceEnabled === '1' && getInt(filterScoreScienceMax) > 0 && getInt(filterScoreScienceMax) < getInt(obj.player.score_science)) return false;
    if (filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMin) > 0 && getInt(filterScoreFleetMin) > getInt(obj.player.score_military)) return false;
    if (filterScoreFleetEnabled === '1' && getInt(filterScoreFleetMax) > 0 && getInt(filterScoreFleetMax) < getInt(obj.player.score_military)) return false;
    if (filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMin) > 0 && getInt(filterScoreDefenseMin) > getInt(obj.player.score_defense)) return false;
    if (filterScoreDefenseEnabled === '1' && getInt(filterScoreDefenseMax) > 0 && getInt(filterScoreDefenseMax) < getInt(obj.player.score_defense)) return false;
    if (filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMin) > 0 && getInt(filterInactiveSinceMin) > getInt(obj.inactive_since)) return false;
    if (filterInactiveSinceEnabled === '1' && getInt(filterInactiveSinceMax) > 0 && getInt(filterInactiveSinceMax) < getInt(obj.inactive_since)) return false;
    if (filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMin) > 0 && getInt(filterLastBattleReportMin) > getInt(obj.last_battle_report_hours)) return false;
    if (filterLastBattleReportEnabled === '1' && getInt(filterLastBattleReportMax) > 0 && getInt(filterLastBattleReportMax) < getInt(obj.last_battle_report_hours)) return false;
    if (filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMin) > 0 && getInt(filterLastSpyReportMin) > getInt(obj.last_spy_report_hours)) return false;
    if (filterLastSpyReportEnabled === '1' && getInt(filterLastSpyReportMax) > 0 && getInt(filterLastSpyReportMax) < getInt(obj.last_spy_report_hours)) return false;
    if (filterMetalEnabled === '1' && getInt(filterMetalMin) > 0 && getInt(filterMetalMin) > getInt(obj.last_spy_metal)) return false;
    if (filterMetalEnabled === '1' && getInt(filterMetalMax) > 0 && getInt(filterMetalMax) < getInt(obj.last_spy_metal)) return false;
    if (filterCrystalEnabled === '1' && getInt(filterCrystalMin) > 0 && getInt(filterCrystalMin) > getInt(obj.last_spy_crystal)) return false;
    if (filterCrystalEnabled === '1' && getInt(filterCrystalMax) > 0 && getInt(filterCrystalMax) < getInt(obj.last_spy_crystal)) return false;
    if (filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMin) > 0 && getInt(filterDeuteriumMin) > getInt(obj.last_spy_deuterium)) return false;
    if (filterDeuteriumEnabled === '1' && getInt(filterDeuteriumMax) > 0 && getInt(filterDeuteriumMax) < getInt(obj.last_spy_deuterium)) return false;

    return true;
}

window.showSpyReportHistory = function (spyReportHistory) {
    $('body').append('<div id="spyReportBackdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.95); z-index: 10000"></div>');
    $('body').append('<div id="spyReportOverlay" style="position: fixed; top: 25px; left: 25px; right: 25px; max-height: 95%; z-index: 10000; background: #161618; overflow-y: auto"></div>');
    var container = $('#spyReportOverlay');
    var html = '';
    html += showSpyReportHistoryBox(spyReportHistory, 'resources');
    html += showSpyReportHistoryBox(spyReportHistory, 'fleet');
    html += showSpyReportHistoryBox(spyReportHistory, 'defense');
    html += showSpyReportHistoryBox(spyReportHistory, 'science');
    html += showSpyReportHistoryBox(spyReportHistory, 'buildings');

    $(container).html(html);

    // close by ESC or backdrop click
    $(window).keydown(function (event) {
        if (event.key === 'Escape') {
            $('#spyReportOverlay').remove();
            $('#spyReportBackdrop').remove();
        }
    });

    $('#spyReportBackdrop').click(function () {
        $('#spyReportOverlay').remove();
        $('#spyReportBackdrop').remove();
    });
};
window.showSpyReportHistoryBox = function (spyReportHistory, offset) {
    var html = '<table width="100%" style="max-width: 100% !important" class="table519"><tr>';
    html += '<th style="text-align: left; width: 250px" width="200">Zeit</th>';

    $(spyReportHistory[offset].data[0].values).each(function (key, obj) {
        html += '<th style="text-align: center;">' + obj.name + '</th>';
    });

    html += '</tr>';

    $(spyReportHistory[offset].data).each(function (key, obj) {
        html += '<tr>';
        html += '<td style="text-align: left;">' + obj.timestamp + '</td>';

        $(obj.values).each(function (key, value) {
            value.value = value.value === null ? '---' : value.value;
            html += '<td style="position: relative; ' + (value.value.toString() !== '0' && value.value.toString() !== '---' ? 'color: #fff' : 'color: #444') + '">';
            html += value.value;

            if (value.difference === null || value.difference === 0 || value.valueBefore === value.value) {
                // nothing to show
            } else if (value.valueBefore && value.valueBefore > value.value) {
                html += ' <span style="color: ' + getRgb(cRed) + '; position: absolute; right: 15px">' + value.difference + '</span>';
            } else {
                html += ' <span style="color: ' + getRgb(cGreen) + '; position: absolute; right: 15px">+' + value.difference + '</span>';
            }

            html += '</td>';
        });

        html += '</tr>';
    });

    html += '</table>';

    return html;
};

window.parseUrl = function () {
    replaceFixColors();

    $('head').append('<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous"/>');
    const url = window.location.href.replace('www.', '');

    // overview page
    if (url === 'https://pr0game.com/game.php' || url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=overview/) === 0) {
        window.pageOverview = new PageOverview();
        pageOverview.init();
    }

    // stats page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=statistics/) === 0) {
        parsePageStatistics();
    }

    // message page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=messages/) === 0) {
        window.pageMessages = new PageMessages();
        pageMessages.init();
    }

    // galaxy page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=galaxy/) === 0) {
        parsePageGalaxy();
    }

    // player page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=playerCard/) === 0) {
        parsePagePlayerCard();
    }

    // player page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=alliance/) === 0) {
        parsePageAlliance();
    }

    // buildings page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=buildings/) === 0) {
        window.pageBuildings = new PageBuildings();
        pageBuildings.init();
    }

    // buildings page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=shipyard/) === 0) {
        window.pageHangar = new PageHangar();
        pageHangar.init();
    }

    // research page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=research/) === 0) {
        window.pageResearch = new PageResearch();
        pageResearch.init();
    }

    // fleet page
    else if (url.search(/https\:\/\/pr0game\.com\/game\.php\?page\=fleetTable/) === 0) {
        window.pageFleet = new PageFleet();
        pageFleet.init();
    }

    window.pageHub = new PageHub();
    pageHub.init();

    window.menu = new Menu();
    menu.init();
};

// colors
window.cBlack = [22, 22, 24];
window.cWhite = [242, 245, 244];
window.cRed = [238, 77, 46];
window.cGray = [136, 136, 136];
window.cPink = [255, 0, 130];
window.cGreen = [92, 184, 92];
window.cBlue = [0, 143, 255];
window.cYellow = [247, 197, 22];
window.cCyan = [0, 255, 255];

window.ownCoords = getCoordinates($('#planetSelector option:selected').html());
window.ownGalaxy = ownCoords[1];
window.ownSystem = ownCoords[2];
window.ownPlanet = ownCoords[3];
window.showGalaxy = ownGalaxy;
window.ownPlayer = null;
window.menu = null;
window.pageHub = null;
window.pageOverview = null;
window.pageBuildings = null;
window.pageHangar = null;
window.pageDefense = null;
window.pageResearch = null;
window.pageGalaxy = null;
window.pageFleet = null;
window.pageMessages = null;
window.pageTechnologies = null;
window.pageResources = null;
window.rxNumber = '([.0-9]+)';
window.cfgHighlight = {};

let filterInactive = getValue('filter_inactive') || 'ALL';
let filterNoobs = getValue('filter_noobs') || 'ALL';
let filterVacation = getValue('filter_vacation') || 'ALL';
let filterAlliance = getValue('filter_alliance') || 'ALL';
let filterSpyReport = getValue('filter_spy_report') || 'ALL';
let filterBattleReport = getValue('filter_last_battle_report') || 'ALL';
let filterScoreEnabled = getValue('filter_score_enable') || '0';
let filterScoreMin = getValue('filter_score_min') || '';
let filterScoreMax = getValue('filter_score_max') || '';
let filterScoreBuildingEnabled = getValue('filter_score_building_enable') || '0';
let filterScoreBuildingMin = getValue('filter_score_building_min') || '';
let filterScoreBuildingMax = getValue('filter_score_building_max') || '';
let filterScoreScienceEnabled = getValue('filter_score_science_enable') || '0';
let filterScoreScienceMin = getValue('filter_score_science_min') || '';
let filterScoreScienceMax = getValue('filter_score_science_max') || '';
let filterScoreFleetEnabled = getValue('filter_score_fleet_enable') || '0';
let filterScoreFleetMin = getValue('filter_score_fleet_min') || '';
let filterScoreFleetMax = getValue('filter_score_fleet_max') || '';
let filterScoreDefenseEnabled = getValue('filter_score_defense_enable') || '0';
let filterScoreDefenseMin = getValue('filter_score_defense_min') || '';
let filterScoreDefenseMax = getValue('filter_score_defense_max') || '';
let filterInactiveSinceEnabled = getValue('filter_inactive_since_enable') || '0';
let filterInactiveSinceMin = getValue('filter_inactive_since_min') || '';
let filterInactiveSinceMax = getValue('filter_inactive_since_max') || '';
let filterLastBattleReportEnabled = getValue('filter_last_battle_report_enable') || '0';
let filterLastBattleReportMin = getValue('filter_last_battle_report_min') || '';
let filterLastBattleReportMax = getValue('filter_last_battle_report_max') || '';
let filterLastSpyReportEnabled = getValue('filter_last_spy_report_enable') || '0';
let filterLastSpyReportMin = getValue('filter_last_spy_report_min') || '';
let filterLastSpyReportMax = getValue('filter_last_spy_report_max') || '';
let filterMetalEnabled = getValue('filter_metal_enable') || '0';
let filterMetalMin = getValue('filter_metal_min') || '';
let filterMetalMax = getValue('filter_metal_max') || '';
let filterCrystalEnabled = getValue('filter_crystal_enable') || '0';
let filterCrystalMin = getValue('filter_crystal_min') || '';
let filterCrystalMax = getValue('filter_crystal_max') || '';
let filterDeuteriumEnabled = getValue('filter_deuterium_enable') || '0';
let filterDeuteriumMin = getValue('filter_deuterium_min') || '';
let filterDeuteriumMax = getValue('filter_deuterium_max') || '';

parseUrl();
