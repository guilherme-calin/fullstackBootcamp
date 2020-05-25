window.addEventListener('load', () => {
    let redControl = document.getElementById('js-red-control');
    let greenControl = document.getElementById('js-green-control');
    let blueControl = document.getElementById('js-blue-control');

    initialConfig();

    redControl.addEventListener('mousemove', () => {
        changeColor('red');
    });
    redControl.addEventListener('keydown', () => {
        changeColor('red');
    });

    greenControl.addEventListener('mousemove', () => {
        changeColor('green');
    });
    greenControl.addEventListener('keydown', () => {
        changeColor('green');
    });

    blueControl.addEventListener('mousemove', () => {
        changeColor('blue');
    });
    blueControl.addEventListener('keydown', () => {
        changeColor('blue');
    });
});

function initialConfig() {
    let redControl = document.getElementById('js-red-control');
    let greenControl = document.getElementById('js-green-control');
    let blueControl = document.getElementById('js-blue-control');

    let redValue = document.getElementById('js-red-value');
    let greenValue = document.getElementById('js-green-value');
    let blueValue = document.getElementById('js-blue-value');

    let colorBox = document.getElementById('js-color-box');

    redValue.value = redControl.value;
    greenValue.value = greenControl.value;
    blueValue.value = blueControl.value;

    colorBox.style.backgroundColor = `rgb(${redValue.value},${greenValue.value},${blueValue.value})`;
}

function changeColor(colorInput) {
    console.log(colorInput);
    let redControl = document.getElementById('js-red-control');
    let redValue = document.getElementById('js-red-value');
    let red = redControl.value;

    let greenControl = document.getElementById('js-green-control');
    let greenValue = document.getElementById('js-green-value');
    let green = greenControl.value;

    let blueControl = document.getElementById('js-blue-control');
    let blueValue = document.getElementById('js-blue-value');
    let blue = blueControl.value;

    let colorBox = document.getElementById('js-color-box');

    if (colorInput === "red") {
        redValue.value = red;
    } else if (colorInput === "green") {
        greenValue.value = green;
    } else if (colorInput === "blue") {
        blueValue.value = blue;
    }

    colorBox.style.backgroundColor = `rgb(${red},${green},${blue})`;
}