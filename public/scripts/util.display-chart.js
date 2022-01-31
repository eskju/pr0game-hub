window.displayChart = function(playerId) {
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
    getJSON('players' + (playerId ? '/' + playerId : '') + '/chart', function(response) {
        const chartRespone = JSON.parse(response.responseText);
        const dates = [];
        const score = [];
        const scoreBuilding = [];
        const scoreResearch = [];
        const scoreMilitary = [];
        const scoreDefense = [];

        $.each(chartRespone, function(key, obj) {
            dates.push(obj.date);
            score.push(obj.score);
            scoreBuilding.push(obj.score_building);
            scoreResearch.push(obj.score_science);
            scoreMilitary.push(obj.score_military);
            scoreDefense.push(obj.score_defense);
        });

        $('body').animate({ opacity: 1}, 500, function() {
            const myChart = new Chart(
                document.getElementById('playerChart'),
                {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: 'Punkte',
                                data: score,
                                borderColor: '#008fff',
                                borderWidth: 2,
                                radius: 2
                            },
                            {
                                label: 'Gebäude',
                                data: scoreBuilding,
                                borderColor: '#addc8d',
                                borderWidth: 1,
                                borderDash: [2, 2],
                                radius: 2
                            },
                            {
                                label: 'Forschung',
                                data: scoreResearch,
                                borderColor: '#843bff',
                                borderWidth: 1,
                                borderDash: [2, 2],
                                radius: 2
                            },
                            {
                                label: 'Militär',
                                data: scoreMilitary,
                                borderColor: '#c52b2f',
                                borderWidth: 1,
                                borderDash: [2, 2],
                                radius: 2
                            },
                            {
                                label: 'Verteidigung',
                                data: scoreDefense,
                                borderColor: '#ffc166',
                                borderWidth: 1,
                                borderDash: [2, 2],
                                radius: 2
                            }
                        ],
                    },
                    options: {
                        scales: {
                            x: {
                                display: playerId !== undefined
                            }
                        },
                        plugins: {
                            legend: {
                                display: playerId !== undefined
                            }
                        }
                    }
                }
            );
        });
    });
};
