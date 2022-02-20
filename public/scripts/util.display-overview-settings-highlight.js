window.displayOverviewHighlight = function(label, alias, color, placeholder='Schwellwert') {
    let html = '<tr class="settings-filter settings-filter-highlighting">';
    html += '<td width="50%" style="text-align: left; color: ' + getRgb(color) + '">' + label + '</td>';
    html += '<td width="4%">';
    html += '<input id="' + alias + '" class="phFilter" data-alias="' + alias + '_enable" value="1" type="checkbox" ' + (getValue(alias + '_enable') === '1' ? 'checked' : '') + '>';
    html += '</td>';
    html += '<td width="46%" colspan="2">';
    html += '<input id="' + alias + '_value" class="phFilter" data-alias="' + alias + '_value" style="width: 100%" placeholder="' + placeholder + '" value="' + (getValue(alias + '_value') || '') + '">';
    html += '</td>';
    html += '</tr>';

    return html;
}
