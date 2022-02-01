window.displayAllianceChart = function (allianceId) {
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
    getJSON('alliances/' + allianceId + '/chart', function (response) {
        const chartRespone = JSON.parse(response.responseText);
        const dates = chartRespone.dates;
        const labels = chartRespone.players;
        const data = [];
        const dataSets = [];
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violette', 'white', 'lightgreen', 'lightblue'];

        for (let i = 0; i < chartRespone.datasets.length; i++) {
            dataSets.push({
                label: labels[i],
                data: chartRespone.datasets[i],
                borderColor: colors[i % colors.length],
                borderWidth: 1,
                radius: 1
            });
        }

        $('content').append('<canvas id="chart" style="width: 95%; margin: 15px auto; height: 500px"></canvas>');
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
