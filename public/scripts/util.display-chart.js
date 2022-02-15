window.displayChart = function (playerId) {
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
    getJSON('players' + (playerId ? '/' + playerId : '') + '/chart', function (response) {
        const chartRespone = JSON.parse(response.responseText);
        const dates = [];
        const ownScore = [];
        const score = [];
        const scoreRelative = [];
        const scoreDiff = [];
        const scoreBuilding = [];
        const scoreResearch = [];
        const scoreMilitary = [];
        const scoreDefense = [];

        $.each(chartRespone, function (key, obj) {
            dates.push(key);
            ownScore.push(obj.own_score);
            score.push(obj.score_max);
            scoreRelative.push(obj.score_relative);
            scoreDiff.push(obj.score_diff);
            scoreBuilding.push(obj.score_building);
            scoreResearch.push(obj.score_science);
            scoreMilitary.push(obj.score_military);
            scoreDefense.push(obj.score_defense);
        });

        $('body').animate({opacity: 1}, 500, function () {
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
                                label: 'Eigene Punkte',
                                data: ownScore,
                                borderColor: '#ffffff',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                radius: 1
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

            new Chart(
                document.getElementById('playerChartBar'),
                {
                    data: {
                        labels: scoreRelative,
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Punktedifferenz relativ (in %)',
                                yAxisID: 'y',
                                data: scoreRelative,
                                backgroundColor: function (context) {
                                    var index = context.dataIndex;
                                    var value = context.dataset.data[index];
                                    return value < 0 ? '#ee4d2e' : '#addc8d';
                                },
                            },
                            {
                                type: 'line',
                                label: 'Punktedifferenz absolut',
                                yAxisID: 'y2',
                                data: scoreDiff,
                                pointRadius: 0,
                                borderWidth: 2,
                                borderColor: '#888888'
                            }
                        ],
                    },
                    options: {
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                type: 'linear',
                                position: 'left'
                            },
                            y2: {
                                type: 'logarithmic',
                                position: 'right'
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                }
            );
        });
    });
};
