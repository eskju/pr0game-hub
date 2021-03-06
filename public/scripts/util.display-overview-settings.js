window.displayOverviewSettings = function () {
    let html = '';
    html += '<div id="phSettings" style="margin: 25px 0; max-width: 100% !important; ' + (getValue('hideSettings') === '1' ? 'display: none' : '') + '">';
    html += '<div style="padding: 12px; text-align: left; background: #121314">';
    html += '<b>Einstellungen</b>';
    html += '<a id="settingsFilterGeneral" class="settings-button settings-button-general" style="cursor: pointer; display: inline-block; margin-left: 10px; padding: 5px 10px; border: 1px solid rgba(255, 255, 255, 0.1)">Allgemein</a>';
    html += '<a id="settingsFilterHighlighting" class="settings-button settings-button-highlighting" style="cursor: pointer; display: inline-block; margin-left: 2px; padding: 5px 10px; border: 1px solid rgba(255, 255, 255, 0.1)">Highlighting</a>';
    html += '<a id="settingsFilterFilter" class="settings-button settings-button-filter" style="cursor: pointer; display: inline-block; margin-left: 2px; padding: 5px 10px; border: 1px solid rgba(255, 255, 255, 0.1)">Filter</a>';
    html += '<a id="settingsFilterThresholds" class="settings-button settings-button-thresholds" style="cursor: pointer; display: inline-block; margin-left: 2px; padding: 5px 10px; border: 1px solid rgba(255, 255, 255, 0.1)">Thresholds</a>';
    html += '<a id="settingsFilterFriends" class="settings-button settings-button-friends" style="cursor: pointer; display: inline-block; margin-left: 2px; padding: 5px 10px; border: 1px solid rgba(255, 255, 255, 0.1)">Freunde &amp; Feinde</a>';
    html += '</div>';
    html += '<table width="100%" class="table519">';
    html += '<tr class="settings-filter settings-filter-general"><th colspan="4">Allgemein</th></tr>';
    html += '<tr class="settings-filter settings-filter-general"><td colspan="4"><p style="font-size: 11px; text-align: left;">Solltest Du keinen API Key besitzen, wende Dich bitte per Discord an @eichhorn#1526.<br><b style="color: ' + getRgb(cRed) + '">Gib Deinen API Key nicht an andere weiter!</b></p></td></tr>';
    html += '<tr class="settings-filter settings-filter-general">';
    html += '<td width="50%" style="text-align: left">API Key</td>';
    html += '<td colspan="3"><input class="phFilter" data-alias="api_key" type="text" style="width: 100%" placeholder="API Key" value="' + (getValue('api_key') || '') + '"></td>';
    html + '</tr>';
    html += '<tr class="settings-filter settings-filter-general">';
    html += '<td width="50%" style="text-align: left">Debug-Modus</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="debug_mode" value="1" ' + (getValue('debug_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Zeige Infos in der Konsole</td>';
    html + '</tr>';
    html += '<tr class="settings-filter settings-filter-general">';
    html += '<td width="50%" style="text-align: left">Developer-Modus</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="developer_mode" value="1" ' + (getValue('developer_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Nutzt die Entwickler-API (nur zum Coden!)</td>';
    html + '</tr>';
    html += '<tr class="settings-filter settings-filter-general">';
    html += '<td width="50%" style="text-align: left">Leserliches Datumsformat</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="date_for_humans" value="1" ' + (getValue('date_for_humans') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">z.B. "vor 5min" statt Datum/Uhrzeit. Erfordert Reload (F5)!</td>';
    html + '</tr>';
    html += displayOverviewSettingsPlayerVar('Zeilen im Spio-Bericht (je Kategorie)', 'filter_spy_report_lines', 'general');

    html += '<tr class="settings-filter settings-filter-highlighting"><th colspan="4">HIGHLIGHTING</th></tr>';
    html += '<tr class="settings-filter settings-filter-highlighting"><td colspan="4"><p style="font-size: 11px; text-align: left;">Standardm????ig werden die Spielerwerte als Referenz genommen; F??r Galaxie/System/Planet wird standardm????ig der aktive Planet gesetzt. Ist die Checkbox angehakt, wird der jeweilige Wert vom Eingetragenen ??berschrieben. Die Spieler-Werte werden in der Farbskala wei?? (0 Punkte) bis Farbe (gesetztes Punktelimit) dargestellt.</p></td></tr>';
    html += displayOverviewHighlight('Gesamtpunkte', 'highlight_score', cBlue);
    html += displayOverviewHighlight('Geb??udepunkte', 'highlight_score_building', cGreen);
    html += displayOverviewHighlight('Forschungspunkte', 'highlight_score_science', cPink);
    html += displayOverviewHighlight('Milit??rpunkte', 'highlight_score_military', cRed);
    html += displayOverviewHighlight('Verteidigungspunkte', 'highlight_score_defense', cYellow);
    html += displayOverviewHighlight('Galaxie ??berschreiben? (z.B. 4 f??r Gala 4)', 'show_galaxy', cWhite, 'Galaxie Nummer');

    html += '<tr class="settings-filter settings-filter-filter"><th colspan="4">FILTER</th></tr>';
    html += displayOverviewSettingsSelect(getHotkeyIcon('I') + 'Inaktive Spieler', 'filter_inactive', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });
    html += displayOverviewSettingsSelect(getHotkeyIcon('N') + 'Spieler mit Noobschutz', 'filter_noobs', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });
    html += displayOverviewSettingsSelect(getHotkeyIcon('U') + 'Spieler im Urlaubsmodus', 'filter_vacation', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });
    html += displayOverviewSettingsSelect(getHotkeyIcon('A') + 'Spieler der Allianz', 'filter_alliance', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });
    html += displayOverviewSettingsSelect(getHotkeyIcon('S') + 'Spieler mit Spiobericht', 'filter_spy_report', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });
    html += displayOverviewSettingsSelect(getHotkeyIcon('K') + 'Spieler mit Kampfbericht', 'filter_battle_report', {
        ALL: 'Anzeigen',
        HIDE: 'Ausblenden',
        ONLY: 'Andere ausblenden'
    });

    html += '<tr class="settings-filter settings-filter-thresholds"><th colspan="4">THRESHOLDS</th></tr>';
    html += displayOverviewSettingsRange(getHotkeyIcon('P', true) + 'Punkte', 'filter_score');
    html += displayOverviewSettingsRange(getHotkeyIcon('G', true) + 'Geb??udepunkte', 'filter_score_building');
    html += displayOverviewSettingsRange(getHotkeyIcon('F', true) + 'Forschungspunkte', 'filter_score_science');
    html += displayOverviewSettingsRange(getHotkeyIcon('M', true) + 'Milit??rpunkte', 'filter_score_fleet');
    html += displayOverviewSettingsRange(getHotkeyIcon('V', true) + 'Verteidigungspunkte', 'filter_score_defense');
    html += displayOverviewSettingsRange(getHotkeyIcon('I', true) + 'Inaktiv seit ... Stunden', 'filter_inactive_since');
    html += displayOverviewSettingsRange(getHotkeyIcon('K', true) + 'Stunden seit letztem Kampfbericht', 'filter_last_battle_report');
    html += displayOverviewSettingsRange(getHotkeyIcon('S', true) + 'Stunden seit letztem Spionagebericht', 'filter_last_spy_report');
    html += displayOverviewSettingsRange(getHotkeyIcon('Q', true) + 'Metall (letzte Spionage)', 'filter_metal');
    html += displayOverviewSettingsRange(getHotkeyIcon('W', true) + 'Kristall (letzte Spionage)', 'filter_crystal');
    html += displayOverviewSettingsRange(getHotkeyIcon('E', true) + 'Deuterium (letzte Spionage)', 'filter_deuterium');

    html += '<tr class="settings-filter settings-filter-friends"><th colspan="4">FREUNDE &amp; FEINDE</th></tr>';
    html += '<tr class="settings-filter settings-filter-friends"><td colspan="4" style="text-align: left">Bitte kommagetrennt die Spieler- bzw. Allianz-IDs eintragen. Die IDs findet Ihr in der URL der Spieler- bzw. Allianzprofile.<br>Betroffene Spieler und Allianzen werden in der Planeten??bersicht farblich hervorgehoben.</td></tr>';
    html += displayOverviewSettingsPlayerVar('Befreundete Allianz-IDs', 'filter_ids_friend_alliances', 'friends');
    html += displayOverviewSettingsPlayerVar('Befreundete Spieler-IDs', 'filter_ids_friends', 'friends');
    html += displayOverviewSettingsPlayerVar('Verfeindete Allianz-IDs', 'filter_ids_enemy_alliances', 'friends');
    html += displayOverviewSettingsPlayerVar('Verfeindete Spieler-IDs', 'filter_ids_enemies', 'friends');

    html += '</table>';
    html += '</div>';

    // 843
    // 19, 933

    // 262
    // 25

    return html;
}
