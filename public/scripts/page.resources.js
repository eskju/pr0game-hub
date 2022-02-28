window.PageResources = function () {
    const $this = this;

    this.init = function () {
        this.parseLines($('content table tr'));
    };

    this.parseLines = function (rows) {
        let label;

        $.each(rows, function (key, obj) {
            label = $($(obj).find('td')[0]).find('a').length === 0 ? $($(obj).find('td')[0]).html() : $($(obj).find('td > a')[0]).html();

            switch (label) {
                case 'Lagerkapazität':
                    setValue(ownCoords[0] + '_limit_metal', $this.parseCapacity($($($(obj).find('td')[1]).find('span')).html()));
                    setValue(ownCoords[0] + '_limit_crystal', $this.parseCapacity($($($(obj).find('td')[2]).find('span')).html()));
                    setValue(ownCoords[0] + '_limit_deuterium', $this.parseCapacity($($($(obj).find('td')[3]).find('span')).html()));
                    break;

                case 'Pro Tag':
                    setValue(ownCoords[0] + '_production_metal', getInt($($($(obj).find('td')[1]).find('span')).html()).toString());
                    setValue(ownCoords[0] + '_production_crystal', getInt($($($(obj).find('td')[2]).find('span')).html()).toString());
                    setValue(ownCoords[0] + '_production_deuterium', getInt($($($(obj).find('td')[3]).find('span')).html()).toString());
                    setValue(ownCoords[0] + '_production_energy', getInt($($($(obj).find('td')[4]).find('span')).html()).toString());
                    break;
            }
        });
    }

    this.parseCapacity = function (value) {
        let multiplier = 1;

        if (value.search(/K/) !== -1) {
            multiplier = 1000;
        }

        if (value.search(/M/) !== -1) {
            multiplier = 1000;
            value = parseFloat(value.replace(/,/, '.')) * 1000;
        }

        return getInt(value) * multiplier;
    };
}
