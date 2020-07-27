import { promises as fsP } from 'fs'

export class App {
    constructor() {}

    static getJsonFile(filePath, fileDescription) {
        let returnObject = {};

        return new Promise((resolve, reject) => {
            fsP.readFile(filePath).then(file => {
                const fileAsObject = JSON.parse(file);

                returnObject.sucess = true;
                returnObject.errorMessage = "";
                returnObject.fileDescription = fileDescription != undefined ? fileDescription : "Não definido";
                returnObject.fileAsObject = fileAsObject;

                resolve(returnObject);
            }).catch(error => {
                reject(error);
            });

        })
    }

    static createFilesByState(citiesObject, statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            let citiesOrderedByState = [];
            let statesWithCities = [];
            let currentStateId = 1;
            let citiesIndex = 0;
            let promisesArray = [];

            citiesOrderedByState = citiesObject.sort((city1, city2) => {
                return city1.Estado - city2.Estado;
            });

            for (let i = 0; i < statesObject.length; ++i) {
                statesWithCities.push({
                    stateID: statesObject[i].ID,
                    stateAbbreviation: statesObject[i].Sigla,
                    cities: []
                });

                while (citiesIndex < citiesOrderedByState.length && citiesOrderedByState[citiesIndex].Estado == currentStateId) {
                    statesWithCities[i].cities.push(citiesOrderedByState[citiesIndex]);
                    citiesIndex++;
                }

                currentStateId++;
            }

            for (let i = 0; i < statesWithCities.length; ++i) {
                promisesArray.push(
                    fsP.writeFile(`${outputPath}/${statesWithCities[i].stateAbbreviation}.json`,
                        JSON.stringify(statesWithCities[i].cities.map(item => {
                            return {
                                ID: item.ID,
                                Nome: item.Nome
                            }
                        })))
                );
            }

            Promise.all(promisesArray).then(_v => {
                resolve("Todos os arquivos de cada estado criados com sucesso!");
            }).catch(_e => {
                reject("Erro na criação de um ou mais arquivos!");
            })
        });
    }

    static __getObjectWithCitiesNumberByState(stateAbbreviation, outputPath) {
        return new Promise((resolve, reject) => {
            fsP.readFile(`${outputPath}/${stateAbbreviation}.json`).then(fileBuffer => {
                let fileAsObject = JSON.parse(fileBuffer);

                resolve({
                    stateAbbreviation: stateAbbreviation,
                    citiesNumber: fileAsObject.length
                });
            }).catch(err => {
                reject(err);
            });
        })
    }

    static __getArrayWithCitiesNumberByState(statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            let promisesArray = [];

            for (let i = 0; i < statesObject.length; ++i) {
                promisesArray.push(
                    this.__getObjectWithCitiesNumberByState(statesObject[i].Sigla, outputPath)
                )
            }

            Promise.all(promisesArray).then(array => {
                resolve(array);
            }).catch(err => {
                reject(err);
            });
        })
    }

    static getArrayWithStatesWithMostCities(statesObject, outputPath, numberOfStates) {
        return new Promise((resolve, reject) => {
            if (numberOfStates > statesObject.length) {
                reject("Quantidade de estados informados maior do que a quantidade de estados disponíveis no arquivo!");
            }

            this.__getArrayWithCitiesNumberByState(statesObject, outputPath).then(array => {
                let arrayWithMostCities = [];
                let orderedArray = array.sort((stateA, stateB) => stateB.citiesNumber - stateA.citiesNumber);

                for (let i = 0; i < numberOfStates; i++) {
                    arrayWithMostCities.push(orderedArray[i]);
                }

                resolve(arrayWithMostCities);
            }).catch(err => {
                reject(err);
            });

        });
    }

    static getArrayWithStatesWithLessCities(statesObject, outputPath, numberOfStates) {
        return new Promise((resolve, reject) => {
            if (numberOfStates > statesObject.length) {
                reject("Quantidade de estados informados maior do que a quantidade de estados disponíveis no arquivo!");
            }

            this.__getArrayWithCitiesNumberByState(statesObject, outputPath).then(array => {
                let arrayWithLessCitiesAsc = [];
                let arrayWithLessCitiesDesc = [];
                let orderedArray = array.sort((stateA, stateB) => stateA.citiesNumber - stateB.citiesNumber);

                for (let i = 0; i < numberOfStates; i++) {
                    arrayWithLessCitiesAsc.push(orderedArray[i]);
                }

                arrayWithLessCitiesDesc = arrayWithLessCitiesAsc.sort((stateA, stateB) => stateB.citiesNumber - stateA.citiesNumber);

                resolve(arrayWithLessCitiesDesc);
            }).catch(err => {
                reject(err);
            });

        });
    }

    static __getBiggestCityNameByState(stateAbbreviation, outputPath) {
        return new Promise((resolve, reject) => {
            fsP.readFile(`${outputPath}/${stateAbbreviation}.json`).then(fileBuffer => {
                let arrayWithBiggestCityNames = [];
                let orderedArrayWithBiggestCityNames = [];
                let biggestCityName = "";
                let fileAsObject = JSON.parse(fileBuffer);

                let orderedCitiesArray = fileAsObject.sort((city1, city2) => {
                    return city2.Nome.length - city1.Nome.length;
                });

                let biggestLength = orderedCitiesArray[0].Nome.length

                for (let i = 0; i < orderedCitiesArray.length && orderedCitiesArray[i].Nome.length === biggestLength; ++i) {
                    arrayWithBiggestCityNames.push(orderedCitiesArray[i]);
                }

                orderedArrayWithBiggestCityNames = arrayWithBiggestCityNames.sort((city1, city2) => {
                    return city1.Nome.localeCompare(city2.Nome);
                });

                resolve({
                    stateAbbreviation: stateAbbreviation,
                    biggestCityName: arrayWithBiggestCityNames[0].Nome
                });

            }).catch(err => {
                reject(err);
            });
        })
    }

    static getArrayWithBiggestCityNameFromAllStates(statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            let promisesArray = [];

            for (let i = 0; i < statesObject.length; ++i) {
                promisesArray.push(
                    this.__getBiggestCityNameByState(statesObject[i].Sigla, outputPath)
                )
            }

            Promise.all(promisesArray).then(array => {
                resolve(array);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static __getSmallestCityNameByState(stateAbbreviation, outputPath) {
        return new Promise((resolve, reject) => {
            fsP.readFile(`${outputPath}/${stateAbbreviation}.json`).then(fileBuffer => {
                let arrayWithSmallestCityNames = [];
                let orderedArrayWithSmallestCityNames = [];
                let smallestCityName = "";
                let fileAsObject = JSON.parse(fileBuffer);

                let orderedCitiesArray = fileAsObject.sort((city1, city2) => {
                    return city1.Nome.length - city2.Nome.length;
                });

                let smallestLength = orderedCitiesArray[0].Nome.length

                for (let i = 0; i < orderedCitiesArray.length && orderedCitiesArray[i].Nome.length === smallestLength; ++i) {
                    arrayWithSmallestCityNames.push(orderedCitiesArray[i]);
                }

                orderedArrayWithSmallestCityNames = arrayWithSmallestCityNames.sort((city1, city2) => {
                    return city1.Nome.localeCompare(city2.Nome);
                });

                resolve({
                    stateAbbreviation: stateAbbreviation,
                    smallestCityName: arrayWithSmallestCityNames[0].Nome
                });

            }).catch(err => {
                reject(err);
            });
        })
    }

    static getArrayWithSmallestCityNameFromAllStates(statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            let promisesArray = [];

            for (let i = 0; i < statesObject.length; ++i) {
                promisesArray.push(
                    this.__getSmallestCityNameByState(statesObject[i].Sigla, outputPath)
                )
            }

            Promise.all(promisesArray).then(array => {
                resolve(array);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static getBiggestCityNameOfAllStates(statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            this.getArrayWithBiggestCityNameFromAllStates(statesObject, outputPath).then(array => {
                let arrayWithBiggestCityNames = [];
                let orderedArrayWithBiggestCityNames = [];
                let biggestCityNameObject = null;

                let orderedCityNamesArray = array.sort((cityA, cityB) => cityB.biggestCityName.length - cityA.biggestCityName.length);

                let biggestLength = orderedCityNamesArray[0].biggestCityName.length;

                for (let i = 0; i < orderedCityNamesArray.length && orderedCityNamesArray[i].biggestCityName.length === biggestLength; ++i) {
                    arrayWithBiggestCityNames.push(orderedCityNamesArray[i]);
                }

                orderedArrayWithBiggestCityNames = arrayWithBiggestCityNames.sort((city1, city2) => {
                    return city1.biggestCityName.localeCompare(city2.biggestCityName);
                });

                biggestCityNameObject = orderedArrayWithBiggestCityNames[0];

                resolve({
                    stateAbbreviation: biggestCityNameObject.stateAbbreviation,
                    biggestCityNameOfAllStates: biggestCityNameObject.biggestCityName
                })
            }).catch(err => {
                reject(err);
            })
        });
    }

    static getSmallestCityNameOfAllStates(statesObject, outputPath) {
        return new Promise((resolve, reject) => {
            this.getArrayWithSmallestCityNameFromAllStates(statesObject, outputPath).then(array => {
                let arrayWithSmallestCityNames = [];
                let orderedArrayWithSmallestCityNames = [];
                let smallestCityNameObject = null;

                let orderedCityNamesArray = array.sort((cityA, cityB) => cityA.smallestCityName.length - cityB.smallestCityName.length);

                let smallestLength = orderedCityNamesArray[0].smallestCityName.length;

                for (let i = 0; i < orderedCityNamesArray.length && orderedCityNamesArray[i].smallestCityName.length === smallestLength; ++i) {
                    arrayWithSmallestCityNames.push(orderedCityNamesArray[i]);
                }

                orderedArrayWithSmallestCityNames = arrayWithSmallestCityNames.sort((city1, city2) => {
                    return city1.smallestCityName.localeCompare(city2.smallestCityName);
                });

                smallestCityNameObject = orderedArrayWithSmallestCityNames[0];

                resolve({
                    stateAbbreviation: smallestCityNameObject.stateAbbreviation,
                    smallestCityNameOfAllStates: smallestCityNameObject.smallestCityName
                })
            }).catch(err => {
                reject(err);
            })
        });
    }
}