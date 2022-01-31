window.displayOverviewSettingsSelect = function(label, alias, values) {
    let html = '<tr>';
    html += '<td width="50%" style="text-align: left">' + label + '</td>';
    html += '<td colspan="3">';
    html += '<select id="' + alias + '_select" class="phFilter" data-alias="' + alias + '" style="width: 100%">';

    $.each(values, function(key, obj) {
        html += '<option value="' + key + '" ' + (getValue(alias) === key ? 'selected' : '') + '>' + obj + '</option>';
    });

    html += '</select>';
    html += '</td>';
    html + '</tr>';

    return html;
};
