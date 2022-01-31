window.getCoordinates = function (string) {
    return string ? string.match(/\[([0-9]+)\:([0-9]+)\:([0-9]+)\]/) : false;
}
