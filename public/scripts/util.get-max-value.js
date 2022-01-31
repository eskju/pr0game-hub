window.getMaxValue = function(array, property) {
    let maxValue = null;

    $.each(array, function(key, obj) {
        if(parseInt(obj[property]) > maxValue) {
            maxValue = parseInt(obj[property]);
        }
    });

    return maxValue;
};
