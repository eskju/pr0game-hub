window.CsvToArray = function(string) {
    string = string || '';

    return string.split(',') || [];
};
