import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import TransactionApi from './model/TransactionApi.js'

const transactionFilePath = "./assets/json/original_transactions.json";
const serverPort = process.env.PORT || 3001;
const frontEndHost = "http://localhost:3000";

main();

async function main() {
    
    let server = express();

    prepareEnvironment("./env.json");

    const api = new TransactionApi(frontEndHost);
    try{
        await api.prepareApplication(transactionFilePath);

        server.use(bodyParser.raw({ type: "*/*" }));

        server.put('/transaction/create', api.createTransaction); 
        server.get('/transaction/get', api.getTransaction);
        server.get('/transaction/yearlist', api.getYearList);
        server.delete('/transaction/delete', api.deleteTransaction);
        server.post('/transaction/update', api.updateTransaction);
        server.options("/*", (req,res) => {
            console.log(req);

            let responseBody = {
                sucess : true,
                message : "Options ok!" 
            }

            res.writeHead(200, {
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Headers" : "Content-Type, Content-Length, Accept",
                "Access-Control-Allow-Methods" : "GET, PUT, DELETE, POST",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
        });
        server.all("*", (_,res) => {
            let responseBody = {
                sucess : false,
                message : "Método e/ou rota não encontrado!"
            }

            res.writeHead(404, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
        });
 
        server.listen(serverPort, () => {
          console.log(`Servidor escutando a porta ${serverPort}`); 
        });
    }catch(err){
        console.log(err);
    }

}

async function prepareEnvironment(filePath){
    try {
        const environment = JSON.parse(fs.readFileSync(filePath));

        process.env.DB_CONNECTION = environment.DB_CONNECTION;

        console.log("Arquivo JSON lido!");

        return
    }catch(err) {
        console.log(err);
    }
}
