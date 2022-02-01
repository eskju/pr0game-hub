window.displayAllianceChart = function (allianceId) {
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
    getJSON('alliances/' + allianceId + '/chart', function (response) {
        const chartRespone = JSON.parse(response.responseText);
        const dates = [];
        const labels = [];
        const data = [];
        const dataSets = [];

        $.each(chartRespone, function (key, obj) {
            dates.push(obj.date);
            labels.push(obj.players);
            data.push(obj.datasets);

            for (var i = 0; i < data.length; i++) {
                console.log(i, data[i]);
                dataSets.push({
                    label: labels[i],
                    data: data[i],
                    borderColor: '#008fff',
                    borderWidth: 2,
                    radius: 2
                });
            }
        });

        $('content').append('<canvas id="chart" style="width: 95%; margin: 15px auto; height: 300px"></canvas>');
        $('body').animate({opacity: 1}, 500, function () {
            const myChart = new Chart(
                document.getElementById('chart'),
                {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: dataSets,
                    },
                    options: {
                        scales: {
                            x: {}
                        },
                        plugins: {
                            legend: {}
                        }
                    }
                }
            );
        });
    });
};
