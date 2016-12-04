/**
 * Created by Marcin on 01.12.2016.
 */

$('document').ready(function () {
    // wykres funkcji
    var functionChart = new Chart(document.getElementById("myChart"), {
        type: 'line',
        zoom: {
            enabled: true
        },
        data: {
            datasets: [{
                borderColor: "#00796B",
                fill: false
            }]
        },
        options: {
            elements: {point: {radius: 0}},
            legend: {display: false},
            title: {display: false},
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }],
                yAxes: [{
                    display: true/*,
                     ticks: {
                     max: 10,
                     min: -10,
                     stepSize: 1
                     }*/
                }]
            }
        }
    });

    // wykres aproksymacji
    var approximationChart = new Chart(document.getElementById("myApproximation"), {
        type: 'line',
        zoom: {
            enabled: true
        },
        data: {
            datasets: [{
                borderColor: "#00796B",
                fill: false
            }, {
                fill: false
            }]
        },
        options: {
            elements: {point: {radius: 0}},
            legend: {display: false},
            title: {display: false},
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }],
                yAxes: [{
                    display: true/*,
                     ticks: {
                     max: 10,
                     min: -10,
                     stepSize: 1
                     }*/
                }]
            }
        }
    });

    // wykres aproksymacji
    var discrepancyChart = new Chart(document.getElementById("myDiscrepancy"), {
        type: 'line',
        zoom: {
            enabled: true
        },
        data: {
            datasets: [{
                borderColor: "#00796B",
                fill: false
            }]
        },
        options: {
            elements: {point: {radius: 0}},
            legend: {display: false},
            title: {display: false},
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }],
                yAxes: [{
                    display: true/*,
                     ticks: {
                     max: 10,
                     min: -10,
                     stepSize: 1
                     }*/
                }]
            }
        }
    });

    // pasek do przedziału
    var sliderRange = document.getElementById('sliderRange');
    noUiSlider.create(sliderRange, {
        start: [-5, 5],
        connect: true,
        step: 1,
        range: {
            'min': -10,
            'max': 10
        }
    });
    var skipValues = [
        document.getElementById('zakres-poczatek'),
        document.getElementById('zakres-koniec')
    ];
    sliderRange.noUiSlider.on('update', function (values, handle) {
        skipValues[handle].innerHTML = values[handle];
    });

    // zwijanie i rozwijanie zmiany zakresu funkcji
    var editRangeDiv = document.getElementById('showMoreInSetRangeContent');
    var openCloseEditRangeDiv = document.getElementById('showMoreInSetRangeLabel');
    var isOpeneditRangeDiv = false;
    $(editRangeDiv).hide();
    $(openCloseEditRangeDiv).click(function () {
        $(editRangeDiv).slideToggle();
        if (!isOpeneditRangeDiv) {
            isOpeneditRangeDiv = true;
            openCloseEditRangeDiv.innerHTML = "Ustawienia zaawansowane (zwiń)";
            sliderRange.setAttribute('disabled', true);
        }
        else {
            isOpeneditRangeDiv = false;
            openCloseEditRangeDiv.innerHTML = "Ustawienia zaawansowane (rozwiń)";
            sliderRange.removeAttribute('disabled');
        }
    });

    // ilość funkcji - slider
    var sliderCount = document.getElementById('sliderCountFunction');
    var sliderCountLabel = document.getElementById('countFunctionsLabel');

    noUiSlider.create(sliderCount, {
        start: [5],
        step: 1,
        connect: [true, false],
        range: {
            'min': 1,
            'max': 100
        }
    });
    sliderCount.noUiSlider.on('update', function (values, handle) {
        sliderCountLabel.innerHTML = parseInt(values[handle].toString());
    });

    // ustawienie przycisku kliknięcia
    var buttonExecute = document.getElementById("executeButton");
    buttonExecute.onclick = function () {
        var rangeValues = [];
        if (!isSliderDisabled(sliderRange)) {
            var temp = rangeValues = sliderRange.noUiSlider.get();
            rangeValues[0] = parseInt(temp[0]);
            rangeValues[1] = parseInt(temp[1]);
        }
        else {
            console.log(document.getElementById("inputRangeFrom").value);
            rangeValues.push(document.getElementById("inputRangeFrom").value);
            rangeValues.push(document.getElementById("inputRangeTo").value);
        }
        /*
         functionChart.data.datasets[0].data = calculatePointsToFunction(document.getElementById('functionEquation').value,
         parseFloat(rangeValues[0]), parseFloat(rangeValues[1]), parseFloat((rangeValues[1] - rangeValues[0])) / 1000);
         functionChart.update();
         */
        generateOrUpdateExerything(document.getElementById('functionEquation').value,
            parseFloat(rangeValues[0]), parseFloat(rangeValues[1]),
            parseFloat((rangeValues[1] - rangeValues[0])) / 1000,
            parseInt(sliderCount.noUiSlider.get()), functionChart, approximationChart, discrepancyChart);

        console.log(calka(document.getElementById('functionEquation').value, 0, 10));
    };
});

function isSliderDisabled(slider) {
    return slider.getAttribute('disabled') ? true : false;
}

function generateOrUpdateExerything(equation, rangeStart, rangeEnd, delta,
                                    functionsCount, functionChart, approximationChart, discrepancyChart) {
    //console.log("ilosc funkcji", functionsCount);
    var functionPoints = calculatePointsToFunction(equation, rangeStart, rangeEnd, delta);
    functionChart.data.datasets[0].data = functionPoints;
    functionChart.update();

    var approximationPoints = calculatePointsToFunction(
        makeApproximateFunction(equation, functionsCount), rangeStart, rangeEnd, delta);
    approximationChart.data.datasets[0].data = approximationPoints;
    approximationChart.data.datasets[1].data = functionPoints;
    approximationChart.update();

    var discrepancyPoints = [];
    for (var count = 0; count < approximationPoints.length; count++)
        if (functionPoints[count].x >= -Math.PI && functionPoints[count].x <= Math.PI)
            discrepancyPoints.push({
                x: functionPoints[count].x,
                y: functionPoints[count].y - approximationPoints[count].y
            });
    discrepancyChart.data.datasets[0].data = discrepancyPoints;
    discrepancyChart.update();
}

function makeApproximateFunction(baseFunction, precision/*, form, to*/) {
    // obliczamy wsp
    var factors = FourierFactors(baseFunction, 2 * Math.PI, precision);

    var newEquation = "" + factors[0].a;
    for (var count = 1; count <= precision; count++) {
        newEquation += "+" + factors[count].a + "*sin(" + count + "*x)";
        newEquation += "+" + factors[count].b + "*cos(" + count + "*x)";
    }

    console.log("rownanie", newEquation);
    return newEquation;
}

function FourierFactors(equation, T, factorsCount) {
    var table = [];
    table.push({
        a: calka("(" + equation + ")*cos(" + 0 + "*x)", -Math.PI, Math.PI) / (2 * Math.PI),
        b: NaN
    });

    for (var count = 1; count <= factorsCount; count++) {
        table.push({
            a: calka("(" + equation + ")*sin(" + count + "*x)", -Math.PI, Math.PI) / Math.PI,
            b: calka("(" + equation + ")*cos(" + count + "*x)", -Math.PI, Math.PI) / Math.PI
        });
    }

    console.log("wsp Fouriera: ", table);
    return table;
}

function calculatePointsToFunction(equation, rangeStart, rangeEnd, delta) {
    console.log("fwefc" + rangeStart, rangeEnd);
    var table = [];
    var calc = math.compile(equation);
    console.log("delta = " + delta);
    for (var count = rangeStart; count <= rangeEnd; count += delta) {
        table.push({x: count, y: calc.eval({x: count})});
    }
    console.log("dane policzone");
    return table;
}

function calka(equation, from, to) {
    var sum = 0;
    var step = 0.001;
    var calc = math.compile(equation);
    for (var x = from; x + step <= to; x += step)
        sum += calc.eval({x: x + step / 2}) * step;
    return sum;
}