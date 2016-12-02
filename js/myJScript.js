/**
 * Created by Marcin on 01.12.2016.
 */

$('document').ready(function () {
    // wykres
    var ctx = document.getElementById("myChart");
    var scatterChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
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
                        max: 2,
                        min: -2,
                        stepSize: 1
                    }*/
                }]
            }
        }
    });

    // pasek do przedziału
    var sliderRange = document.getElementById('sliderRange');
    noUiSlider.create(sliderRange, {
        start: [-50, 50],
        connect: true,
        step: 1,
        range: {
            'min': -100,
            'max': 100
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
        if (!isOpeneditRangeDiv)
        {
            isOpeneditRangeDiv = true;
            openCloseEditRangeDiv.innerHTML ="Ustawienia zaawansowane (zwiń)";
            sliderRange.setAttribute('disabled', true);
        }
        else {
            isOpeneditRangeDiv = false;
            openCloseEditRangeDiv.innerHTML ="Ustawienia zaawansowane (rozwiń)";
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
        scatterChart.data.datasets[0].data = calculatePointsToBase(document.getElementById('functionEquation').value, -10, 10, 0.01);
        scatterChart.update();
    };
});

function generateOrUpdateExerything(equation, rangeStart, rangeEnd, delta, functionsCount, baseChart) {

}

function calculatePointsToBase(equation, rangeStart, rangeEnd, delta) {
    var table = [];
    console.log(math.parse(equation).toTex());
    for (var count = rangeStart; count<=rangeEnd; count+=delta)
        table.push({x: count, y: math.eval(equation, {x:count})});
    return table;
}