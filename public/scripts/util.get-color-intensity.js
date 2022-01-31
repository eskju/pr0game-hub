window.getColorIntensity = function (value, threshold) {
    var intensity = value / threshold * 255;
    return intensity > 255 ? 255 : intensity;
}
