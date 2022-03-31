window.PageDefense = function () {
    const $this = this;
    this.data = [];

    this.init = function () {
        const buildings = [];
        let info;
        let level;

        $('.buildn').each(function (key, obj) {
            info = $(obj).html().match(/\.info\(([0-9]+)\)\"\>([^<]+)\<\/a\>/);
            level = $('#val_' + info[1]).html().match(/([.0-9]+)/);

            buildings.push({
                building_id: getInt(info[1]),
                level: level ? getInt(level[1]) : 0
            });
        });

        postJSON('planets/buildings', {
            coordinates: ownGalaxy + ':' + ownSystem + ':' + ownPlanet,
            buildings
        }, function (response) {
            $this.data = JSON.parse(response.responseText);
        });
    };
};
