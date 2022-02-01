window.displayChart = function (allianceId) {
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
    getJSON('alliances/' + allianceId + '/chart', function(response) {
        const chartRespone = JSON.parse(response.responseText);
        const dates = [];
        const labels = [];
        const data = [];
        const dataSets = [];

        $.each(chartRespone, function (key, obj) {
            dates.push(obj.date);
            labels.push(obj.players);
            data.push(obj.data);

            $.each(data, function(key, obj) {
               dataSets.push({
                   label: labels[key],
                   data: obj,
                   borderColor: '#008fff',
                   borderWidth: 2,
                   radius: 2
               },)
            });
        });

        $('body').animate({opacity: 1}, 500, function () {
            const myChart = new Chart(
                document.getElementById('playerChart'),
                {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: dataSets,
                    },
                    options: {
                        scales: {
                            x: {
                            }
                        },
                        plugins: {
                            legend: {
                            }
                        }
                    }
                }
            );
        });
    });
};
