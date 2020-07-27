import { App } from './model/App.js'

export class API{

    constructor({gradesFilePath, gradesFileName, outputPath, outputFileName}){
        this.gradesFilePath = gradesFilePath;
        this.gradesFileName = gradesFileName;
        this.outputPath = outputPath;
        this.outputFileName = outputFileName;
    }

    async static resetGrades(req,res){
        let sucess = true;
        let message = "";
        let grade = {};
        let responseBody = {};

        try {
            await App.resetGradesFile(this.gradesFilePath, this.outputPath, this.gradesFileName, this.outputFileName);

            message = "Notas resetadas com sucesso!";

            responseBody = {
                sucess,
                message,
                grade
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } catch (errorList) {
            sucess = false;
            message = `Não foi possível resetar a nota devido a um ou mais erros`;

            responseBody = {
                sucess,
                message,
                errorList,
                grade
            }

            res.writeHead(500, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        } finally {
            res.end(JSON.stringify(responseBody));
        }
    }
}