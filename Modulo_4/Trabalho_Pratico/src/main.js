import express from 'express'
import bodyParser from 'body-parser'
import API from './model/API.js'
import Database from './model/Database.js'
import File from './model/File.js'

const accountsFilePath = "./assets/json";
const accountsFileName = "original_accounts.json";
const dbName = "bank";
const serverPort = process.argv[2] | 3000;

main();

async function main() {
    const dbConnectionURI = `INSERTCONNECTIONSTRINGHERE`;
    const api = new API(dbConnectionURI);
    let server = express();

    try{
        await api.prepareApplication(accountsFilePath, accountsFileName);

        server.use(bodyParser.raw({ type: "*/*" }));

        server.post('/accounts/deposit', api.deposit); 
        server.post('/accounts/retrieval', api.retrieval);
        server.get('/accounts/checkBalance', api.checkBalance);
        server.delete('/accounts/delete', api.deleteAccount);
        server.post('/accounts/transferBalance', api.transferBalance);
        server.get('/accounts/averageBalance', api.averageBalance);
        server.get('/accounts/lowestBalanceList', api.poorestClients);
        server.get('/accounts/highestBalanceList', api.richestClients); 
        server.post('/accounts/transferToPrivateAgency', api.transferToPrivateAgency);  

        server.listen(serverPort, () => {
            console.log(`Servidor escutando a porta ${serverPort}`);
        });


    }catch(err){
        console.log(err);
    }

}
