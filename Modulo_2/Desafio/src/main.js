import express from 'express'
import bodyParser from 'body-parser'
import API from './model/API.js'

const gradesFilePath = "./assets/json";
const gradesFileName = "original_grades.json";
const outputPath = "./output";
const outputFileName = "grades.json";
const port = process.argv[2] | 3000;

main();

async function main() {
    let server = express();
    const api = new API({gradesFilePath, gradesFileName, outputPath, outputFileName});

    server.use(bodyParser.raw({ type: "*/*" }));

    server.post('/bank/deposit', api.deposit);

    server.put('/createGrade', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let responseBody = {};

        validateRequestBody(req, res);

        let dataObject = {
            student: req.jsonBody.student,
            subject: req.jsonBody.subject,
            type: req.jsonBody.type,
            value: req.jsonBody.value
        }

        try {
            grade = await App.createGrade(outputPath, outputFileName, dataObject);

            message = "Nota criada com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível criar a nota devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.post('/updateGrade', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let id = req.query.id;
        let responseBody = {};

        validateRequestBody(req, res);

        if (id) {
            id = parseFloat(id);
        }

        let dataObject = {
            student: req.jsonBody.student,
            subject: req.jsonBody.subject,
            type: req.jsonBody.type,
            value: req.jsonBody.value
        }

        try {
            grade = await App.updateGrade(outputPath, outputFileName, dataObject, id);

            message = "Nota alterada com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível alterar a nota devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.delete('/deleteGrade', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let id = req.query.id;
        let responseBody = {};

        if (id) {
            id = parseFloat(id);
        }

        try {
            grade = await App.deleteGrade(outputPath, outputFileName, id);

            message = "Nota deletada com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível deletar a nota devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.get('/retrieveGrade', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let id = req.query.id;
        let responseBody = {};

        if (id) {
            id = parseFloat(id);
        }

        try {
            grade = await App.retrieveGrade(outputPath, outputFileName, id);

            message = "Nota obtida com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível obter a nota devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.get('/getTotalScore', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let dataObject = {};
        let student = req.query.student;
        let subject = req.query.subject;
        let responseBody = {};

        dataObject = {
            student,
            subject
        }

        try {
            grade = await App.getSubjectScoreByStudent(outputPath, outputFileName, dataObject);

            message = "Somatório de notas obtido com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível obter o somatório de notas devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.get('/getAverageScore', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let dataObject = {};
        let subject = req.query.subject;
        let type = req.query.type;
        let responseBody = {};

        dataObject = {
            subject,
            type
        }

        try {
            grade = await App.getSubjectAverageByType(outputPath, outputFileName, dataObject);

            message = "Média de notas obtida com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível obter a média de notas devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.get('/getBestScores', async(req, res) => {
        let sucess = true;
        let message = "";
        let grade = {};
        let dataObject = {};
        let subject = req.query.subject;
        let type = req.query.type;
        let responseBody = {};

        dataObject = {
            subject,
            type
        }

        try {
            grade = await App.getBestSubjectScoresByType(outputPath, outputFileName, dataObject, 3);

            message = "Melhores notas obtidas com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (err) {
            sucess = false;
            message = `Não foi possível obter a lista de melhores notas devido ao seguinte erro: ${err}`;

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    });

    server.listen(port, () => {
        console.log(`Servidor escutando a porta ${port}`);
    });

    /*

    const testGrade = {
        student: "Tadeuzin",
        subject: "Calculo 3",
        type: "Class",
        value: 5.2
    }

    const updateGrade = {
        student: "Mr Teta",
        subject: "Física Nuclear",
        type: "PHD",
        value: 9.99
    }

    const gradeScore = {
        student: "Loiane Groner",
        subject: "01 - JavaScript"
    }

    const gradeAverage = {
        type: "Trabalho Prático",
        subject: "01 - JavaScript"
    }
    */
}

function validateRequestBody(req, res) {
    let sucess = true;
    let message = "";
    let grade = {};
    let responseBody = {};
    let jsonBody = {};

    if (req.headers['content-type']) {
        if (req.headers['content-type'] === 'application/json') {
            try {
                jsonBody = JSON.parse(req.body);
                req.jsonBody = jsonBody;
            } catch (err) {
                sucess = false;
                message = `O json enviado é inválido! O seguinte erro aconteceu ao processá-lo: ${err}`;

                responseBody = {
                    sucess,
                    message,
                    grade
                }

                res.writeHead(400, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
                });

                res.end(JSON.stringify(responseBody));
            }
        } else {
            sucess = false;
            message = "Cabeçalho Content-Type com valor diferente de application/json";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));
        }
    } else {
        sucess = false;
        message = "Cabeçalho Content-Type não informado";

        responseBody = {
            sucess,
            message,
            grade
        }

        res.writeHead(400, {
            "Content-Type": "application/json",
            "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
        });

        res.end(JSON.stringify(responseBody));
    }
}