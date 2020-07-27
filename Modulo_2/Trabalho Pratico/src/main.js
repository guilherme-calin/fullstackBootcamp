import { App } from './model/App.js'

const citiesFilePath = './assets/cidades.json';
const citiesFileDescription = "Cidades";
const statesFilePath = './assets/estados.json';
const statesFileDescription = "Estados";
const outputPath = './output';
let cities = null;
let states = null;

main();

async function main(values) {
    try {
        await prepareApplication();

        await App.createFilesByState(cities, states, outputPath);

        App.getArrayWithStatesWithMostCities(states, outputPath, 5).then(statesArrayWithMostCities => {
            console.log(`Estados com mais cidades:`);
            console.log(statesArrayWithMostCities);
            console.log(`*************************`)
        }).catch(err => {
            console.log(err);
        });

        App.getArrayWithStatesWithLessCities(states, outputPath, 5).then(statesArrayWithLessCities => {
            console.log(`Estados com menos cidades:`);
            console.log(statesArrayWithLessCities);
            console.log(`***************************************************`)
        }).catch(err => {
            console.log(err);
        });

        App.getArrayWithBiggestCityNameFromAllStates(states, outputPath).then(arrayWithBiggestCityNames => {
            console.log(`Estados e sua cidade de maior tamanho de nome:`);
            console.log(arrayWithBiggestCityNames);
            console.log(`***************************************************`)
        }).catch(err => {
            console.log(err);
        });


        App.getArrayWithSmallestCityNameFromAllStates(states, outputPath).then(arrayWithSmallestCityNames => {
            console.log(`Estados e sua cidade de menor tamanho de nome:`);
            console.log(arrayWithSmallestCityNames);
            console.log(`***************************************************`)
        }).catch(err => {
            console.log(err);
        });

        App.getBiggestCityNameOfAllStates(states, outputPath).then(biggestCityNameObject => {
            console.log(`Cidade cujo nome possui o maior tamanho dentre todos os estados`);
            console.log(biggestCityNameObject);
            console.log(`***************************************************`)
        }).catch(err => {
            console.log(err);
        });

        App.getSmallestCityNameOfAllStates(states, outputPath).then(smallestCityName => {
            console.log(`Cidade cujo nome possui o menor tamanho dentre todos os estados`);
            console.log(smallestCityName);
            console.log(`***************************************************`)
        }).catch(err => {
            console.log(err);
        });

    } catch (errorMessage) {
        console.log(errorMessage);
    }
}

function prepareApplication() {
    return new Promise((resolve, reject) => {
        let promiseFile1 = App.getJsonFile(citiesFilePath, citiesFileDescription);
        let promiseFile2 = App.getJsonFile(statesFilePath, statesFileDescription);

        Promise.all([promiseFile1, promiseFile2]).then(values => {
            for (let retrievenObject of values) {
                if (retrievenObject.fileDescription === citiesFileDescription) {
                    cities = retrievenObject.fileAsObject;
                } else if (retrievenObject.fileDescription === statesFileDescription) {
                    states = retrievenObject.fileAsObject;
                } else {
                    throw `O objeto retornado pelo método getJsonFile da classe App cuja descrição de arquivo é "${retrievenObject.fileDescription}" não corresponde a um arquivo de cidades ou estados`;
                }
            }
            resolve();
        }).catch(error => {
            console.log(`Ocorreu o seguinte erro na obtenção de informações do arquivo: ${error}`);
            reject("Não foi possível preparar a aplicação para processamento!");
        });
    })
}