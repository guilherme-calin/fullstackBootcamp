import { promises as fsP, constants } from 'fs'

export class App {
    constructor() {}

    static resetGradesFile(gradesFileRelPath, outputRelPath, gradesFileName, outputFileName) {
        return new Promise((resolve, reject) => {
            fsP.copyFile(`${gradesFileRelPath}/${gradesFileName}`, `${outputRelPath}/${outputFileName}`, constants.COPYFILE_FICLONE).
            then(() => resolve(true))
                .catch((err) => reject(err));
        })
    }

    static createGrade(outputRelPath, outputFileName, gradeObject) {
        return new Promise((resolve, reject) => {
            const validationOptions = {
                validateStudent: true,
                validateSubject: true,
                validateType: true,
                validateValue: true
            }

            const validationObject = Private.validateInfo(gradeObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const id = jsonData.nextId;

                    let newGrade = {
                        id: id,
                        student: gradeObject.student.trim(),
                        subject: gradeObject.subject.trim(),
                        type: gradeObject.type.trim(),
                        value: gradeObject.value,
                        timestamp: (new Date()).toISOString()
                    }

                    jsonData.nextId = id + 1;
                    jsonData.grades.push(newGrade);

                    fsP.writeFile(`${outputRelPath}/${outputFileName}`, JSON.stringify(jsonData)).then(() => {
                        resolve(newGrade);
                    }).catch(err => {
                        reject(err);
                    });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static updateGrade(outputRelPath, outputFileName, gradeObject, id) {
        return new Promise((resolve, reject) => {
            const dataObject = {
                id: id,
                ...gradeObject
            }

            const validationOptions = {
                validateId: true,
                validateStudent: true,
                validateSubject: true,
                validateType: true,
                validateValue: true
            }

            const validationObject = Private.validateInfo(dataObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const gradeIndex = Private.findIndexById(jsonData, id);

                    if (!gradeIndex && typeof gradeIndex !== "number") {
                        reject(`O id ${id} informado não foi localizado na base de dados!`);
                    }

                    let alteredGrade = jsonData.grades[gradeIndex];

                    alteredGrade.student = gradeObject.student.trim();
                    alteredGrade.subject = gradeObject.subject.trim();
                    alteredGrade.type = gradeObject.type.trim();
                    alteredGrade.value = gradeObject.value;
                    alteredGrade.timestamp = (new Date()).toISOString();

                    fsP.writeFile(`${outputRelPath}/${outputFileName}`, JSON.stringify(jsonData)).then(() => {
                        resolve(alteredGrade);
                    }).catch(err => {
                        reject(err);
                    });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static deleteGrade(outputRelPath, outputFileName, id) {
        return new Promise((resolve, reject) => {
            const dataObject = {
                id: id
            }
            const validationOptions = {
                validateId: true
            }

            const validationObject = Private.validateInfo(dataObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const gradeIndex = Private.findIndexById(jsonData, id);

                    if (!gradeIndex && typeof gradeIndex !== "number") {
                        reject(`O id ${id} informado não foi localizado na base de dados!`);
                    }

                    let removedGrade = jsonData.grades.splice(gradeIndex, 1);

                    fsP.writeFile(`${outputRelPath}/${outputFileName}`, JSON.stringify(jsonData)).then(() => {
                        resolve(removedGrade);
                    }).catch(err => {
                        reject(err);
                    });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static retrieveGrade(outputRelPath, outputFileName, id) {
        return new Promise((resolve, reject) => {
            const dataObject = {
                id: id
            }
            const validationOptions = {
                validateId: true
            }

            const validationObject = Private.validateInfo(dataObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const gradeIndex = Private.findIndexById(jsonData, id);

                    if (!gradeIndex && typeof gradeIndex !== "number") {
                        reject(`O id ${id} informado não foi localizado na base de dados!`);
                    }

                    let retrievenGrade = jsonData.grades[gradeIndex];

                    resolve(retrievenGrade);
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static getSubjectScoreByStudent(outputRelPath, outputFileName, studentSubjectObject) {
        return new Promise((resolve, reject) => {
            const validationOptions = {
                validateStudent: true,
                validateSubject: true
            }

            const validationObject = Private.validateInfo(studentSubjectObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            console.log(`Passou da validacao inicial`);

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const gradesArray = jsonData.grades;
                    const student = studentSubjectObject.student;
                    const subject = studentSubjectObject.subject;
                    let gradeScore = 0;

                    for (let grade of gradesArray) {
                        if (grade.student.toUpperCase().trim() === student.toUpperCase().trim() && grade.subject.toUpperCase().trim() === subject.toUpperCase().trim()) {
                            gradeScore += grade.value;
                        }
                    }

                    resolve({...studentSubjectObject, gradeScore });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static getSubjectAverageByType(outputRelPath, outputFileName, subjectTypeObject) {
        return new Promise((resolve, reject) => {
            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                const validationOptions = {
                    validateSubject: true,
                    validateType: true,
                }

                const validationObject = Private.validateInfo(subjectTypeObject, validationOptions);

                if (!validationObject.valid) {
                    reject(validationObject.errorMessage);
                }

                try {
                    const jsonData = JSON.parse(data);
                    const gradesArray = jsonData.grades;
                    const subject = subjectTypeObject.subject;
                    const type = subjectTypeObject.type;
                    let totalScore = 0;
                    let numberOfGrades = 0;
                    let averageScore = 0;

                    for (let grade of gradesArray) {
                        if (grade.subject.toUpperCase().trim() === subject.toUpperCase().trim() && grade.type.toUpperCase().trim() === type.toUpperCase().trim()) {
                            totalScore += grade.value;
                            numberOfGrades++;
                        }
                    }

                    if (numberOfGrades) {
                        averageScore = totalScore / numberOfGrades;
                    }

                    resolve({...subjectTypeObject, averageScore });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }

    static getBestSubjectScoresByType(outputRelPath, outputFileName, subjectTypeObject, numberOfGrades) {
        return new Promise((resolve, reject) => {
            const validationOptions = {
                validateSubject: true,
                validateType: true,
            }

            const validationObject = Private.validateInfo(subjectTypeObject, validationOptions);

            if (!validationObject.valid) {
                reject(validationObject.errorMessage);
            }

            fsP.readFile(`${outputRelPath}/${outputFileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    const gradesArray = jsonData.grades;
                    const subject = subjectTypeObject.subject;
                    const type = subjectTypeObject.type;
                    let gradesBySubjectType = []
                    let orderedGradesBySubjectType = [];
                    let bestGradesArray = []

                    for (let grade of gradesArray) {
                        if (grade.subject.toUpperCase().trim() === subject.toUpperCase().trim() && grade.type.toUpperCase().trim() === type.toUpperCase().trim()) {
                            gradesBySubjectType.push(grade);
                        }
                    }

                    orderedGradesBySubjectType = gradesBySubjectType.sort((elemA, elemB) => elemB.value - elemA.value);

                    for (let grade of orderedGradesBySubjectType) {
                        if (bestGradesArray.length < numberOfGrades) {
                            bestGradesArray.push({ number: bestGradesArray.length + 1, grade });
                        }
                    }

                    resolve({ grades: bestGradesArray });
                } catch (err) {
                    reject(err);
                }

            }).catch(err => {
                reject(typeof err);
            })
        });
    }
}

class Private {
    constructor() {}

    static validateInfo(dataObject, validationOptionsObject) {
        let valid = true;
        let errorList = [];

        if (!dataObject) {
            valid = false;
            errorList.push(`As informações necessárias não foram informadas!`);
        } else {
            if (validationOptionsObject.validateId) {
                const typeOfId = typeof dataObject.id;

                if (!dataObject.id) {
                    valid = false;
                    errorList.push(`O id da nota não foi informado ou é inválido!`);
                } else if (typeOfId !== "number") {
                    valid = false;
                    errorList.push(`Tipo incorreto para o id da nota! Esperado: número, Enviado: ${typeOfId}`);
                }
            }

            if (validationOptionsObject.validateStudent) {
                const typeOfStudent = typeof dataObject.student;

                if (!dataObject.student) {
                    valid = false;
                    errorList.push(`Não foi informada a chave student!`);
                } else if (typeOfStudent !== "string") {
                    valid = false;
                    errorList.push(`Tipo incorreto para a chave student! Esperado: string, Enviado: ${typeOfStudent}`);
                }
            }

            if (validationOptionsObject.validateSubject) {
                const typeOfSubject = typeof dataObject.subject;

                if (!dataObject.subject) {
                    valid = false;
                    errorList.push(`Não foi informada a chave subject!`);
                } else if (typeOfSubject !== "string") {
                    valid = false;
                    errorList.push(`Tipo incorreto para a chave subject! Esperado: string, Enviado: ${typeOfSubject}`);
                }
            }

            if (validationOptionsObject.validateType) {
                const typeOfType = typeof dataObject.type;

                if (!dataObject.type) {
                    valid = false;
                    errorList.push(`Não foi informada a chave type!`);
                } else if (typeOfType !== "string") {
                    valid = false;
                    errorList.push(`Tipo incorreto para a chave type! Esperado: string, Enviado: ${typeOfType}`);
                }
            }

            if (validationOptionsObject.validateValue) {
                const typeOfValue = typeof dataObject.value;

                if (!dataObject.value) {
                    valid = false;
                    errorList.push(`Não foi informada a chave value!`);
                } else if (typeOfValue !== "number") {
                    valid = false;
                    errorList.push(`Tipo incorreto para a chave value! Esperado: número, Enviado: ${typeOfValue}`);
                }
            }
        }

        return { valid, errorList };
    }

    static findIndexById(gradeFileAsObject, id) {
        const array = gradeFileAsObject.grades;
        let index;

        for (let i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }
}