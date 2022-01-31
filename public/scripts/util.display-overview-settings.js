window.displayOverviewSettings = function() {
    let html = '';
    html += '<table id="phSettings" width="100%" style="max-width: 100% !important; ' + (getValue('hideSettings') === '1' ? 'display: none' : '') + '" class="table519">';
    html += '<tr><th colspan="4">API</th></tr>';
    html += '<tr><td colspan="4"><p style="font-size: 11px; text-align: left;">Solltest Du keinen API Key besitzen, wende Dich bitte per Discord an @eichhorn#1526.<br><b style="color: ' + getRgb(cRed) + '">Gib Deinen API Key nicht an andere weiter!</b></p></td></tr>';
    html += '<tr>';
    html += '<td width="50%" style="text-align: left">API Key</td>';
    html += '<td colspan="3"><input class="phFilter" data-alias="api_key" type="text" style="width: 100%" placeholder="API Key" value="' + (getValue('api_key') || '') + '"></td>';
    html + '</tr>';
    html += '<tr>';
    html += '<td width="50%" style="text-align: left">Debug-Modus</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="debug_mode" value="1" ' + (getValue('debug_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Zeige Infos in der Konsole</td>';
    html + '</tr>';
    html += '<tr>';
    html += '<td width="50%" style="text-align: left">Developer-Modus</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="developer_mode" value="1" ' + (getValue('developer_mode') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">Nutzt die Entwickler-API (nur zum Coden!)</td>';
    html + '</tr>';
    html += '<tr>';
    html += '<td width="50%" style="text-align: left">Leserliches Datumsformat</td>';
    html += '<td><input type="checkbox" class="phFilter" data-alias="date_for_humans" value="1" ' + (getValue('date_for_humans') === '1' ? 'checked' : '') + '></td><td colspan="2" style="text-align: left; color: #888">z.B. "vor 5min" statt Datum/Uhrzeit. Erfordert Reload (F5)!</td>';
    html + '</tr>';

    html += '<tr><th colspan="4">HIGHLIGHTING</th></tr>';
    html += '<tr><td colspan="4"><p style="font-size: 11px; text-align: left;">Standardmäßig werden die Spielerwerte als Referenz genommen; Für Galaxie/System/Planet wird standardmäßig der aktive Planet gesetzt. Ist die Checkbox angehakt, wird der jeweilige Wert vom Eingetragenen überschrieben. Die Spieler-Werte werden in der Farbskala weiß (0 Punkte) bis Farbe (gesetztes Punktelimit) dargestellt.</p></td></tr>';
    html += displayOverviewHighlight('Gesamtpunkte', 'highlight_score', cBlue);
    html += displayOverviewHighlight('Gebäudepunkte', 'highlight_score_building', cGreen);
    html += displayOverviewHighlight('Forschungspunkte', 'highlight_score_science', cPink);
    html += displayOverviewHighlight('Militärpunkte', 'highlight_score_military', cRed);
    html += displayOverviewHighlight('Verteidigungspunkte', 'highlight_score_defense', cYellow);

    html += '<tr><th colspan="4">FILTER</th></tr>';
    html += displayOverviewSettingsSelect(getHotkeyIcon('I') + 'Inaktive Spieler', 'filter_inactive', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += displayOverviewSettingsSelect(getHotkeyIcon('N') + 'Spieler mit Noobschutz', 'filter_noobs', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += displayOverviewSettingsSelect(getHotkeyIcon('U') + 'Spieler im Urlaubsmodus', 'filter_vacation', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += displayOverviewSettingsSelect(getHotkeyIcon('A') + 'Spieler der Allianz', 'filter_alliance', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += displayOverviewSettingsSelect(getHotkeyIcon('S') + 'Spieler mit Spiobericht', 'filter_spy_report', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += displayOverviewSettingsSelect(getHotkeyIcon('K') + 'Spieler mit Kampfbericht', 'filter_battle_report', {ALL: 'Anzeigen', HIDE: 'Ausblenden', ONLY: 'Andere ausblenden'});
    html += '<tr><th colspan="4">THRESHOLDS</th></tr>';
    html += displayOverviewSettingsRange(getHotkeyIcon('P', true) + 'Punkte', 'filter_score');
    html += displayOverviewSettingsRange(getHotkeyIcon('G', true) + 'Gebäudepunkte', 'filter_score_building');
    html += displayOverviewSettingsRange(getHotkeyIcon('F', true) + 'Forschungspunkte', 'filter_score_science');
    html += displayOverviewSettingsRange(getHotkeyIcon('M', true) + 'Militärpunkte', 'filter_score_fleet');
    html += displayOverviewSettingsRange(getHotkeyIcon('V', true) + 'Verteidigungspunkte', 'filter_score_defense');
    html += displayOverviewSettingsRange(getHotkeyIcon('I', true) + 'Inaktiv seit ... Stunden', 'filter_inactive_since');
    html += displayOverviewSettingsRange(getHotkeyIcon('K', true) + 'Stunden seit letztem Kampfbericht', 'filter_last_battle_report');
    html += displayOverviewSettingsRange(getHotkeyIcon('S', true) + 'Stunden seit letztem Spionagebericht', 'filter_last_spy_report');
    html += displayOverviewSettingsRange(getHotkeyIcon('Q', true) + 'Metall (letzte Spionage)', 'filter_metal');
    html += displayOverviewSettingsRange(getHotkeyIcon('W', true) + 'Kristall (letzte Spionage)', 'filter_crystal');
    html += displayOverviewSettingsRange(getHotkeyIcon('E', true) + 'Deuterium (letzte Spionage)', 'filter_deuterium');
    html += '</table>';

    return html;
}
