import Database from './Database.js'
import File from './File.js'

export default class API{
    dbInstance;

    constructor(dbConnectionURI){
        this.dbInstance = new Database(dbConnectionURI);
    }

    prepareApplication = (filePath, fileName) => {
        return new Promise(async (resolve, reject) => {
            try {
                const collections = await this.dbInstance.checkAllCollections();
    
                let collectionExists = false;
        
                for(let collection of collections) {
                    if(collection.name === "accounts"){
                        collectionExists = true;
                        break;
                    }
                }
        
                if(collectionExists) {
                    await this.dbInstance.dropCollection("accounts");
                }
        
                const validator = {
                    validator: {
                        $jsonSchema: {
                            bsonType: "object",
                            required: ["agencia", "conta", "name", "balance"],
                            properties: {
                                agencia: {
                                    bsonType: "int",
                                    description: "Agência da conta"
                                },
                                conta: {
                                    bsonType: "int",
                                    description: "Número da conta"
                                },
                                nome: {
                                    bsonType: "string",
                                    description: "Nome do titular da conta"
                                },
                                balance: {
                                    bsonType: "int", 
                                    minimum: 0,
                                    description: "Quantidade de dinheiro na conta. Não pode ser inferior a 0" 
                                }
                            }
                        }
                    }
                }
        
                await this.dbInstance.createCollection("accounts", validator);
           
                const accountsFileContent = await File.getJSON(filePath, fileName); 
        
                let bulkOperation = [];
        
                for(let account of accountsFileContent){
                    bulkOperation.push({insertOne: {document: account}});
                }
         
                await this.dbInstance.bulkWrite("accounts", bulkOperation);
            
                resolve("Aplicação inicializada com sucesso!");
            }catch(err) {  
                await this.dbInstance.closeConnection();
    
                reject(`Ocorreu o seguinte erro ao inicializar a aplicação: ${err}`); 
            }
        });
    }

    deposit = async (req, res) => {
            let responseBody = {};
            let validation = {};
            let currentBalance = 0;

            validation = Private.validateRequestBody(req, res);

            if(!validation.valid){
                this.errorHandling(res, "jsonBodyValidation", validation.errorList);
                return
            }

            const validationOptions = {
                validateAgency: true,
                validateAccount: true,
                validateAmount: true
            }

            validation = Private.validateInformation(req.jsonBody, validationOptions); 

            if(!validation.valid){
                this.errorHandling(res, "jsonBodyInformation", validation.errorList);
                return
            }

            try {
                const queryFields = {
                    agencia: req.jsonBody.agencia,
                    conta: req.jsonBody.conta
                }

                const results = await this.dbInstance.query("accounts", queryFields);  

                console.log(results);

                if(results.length == 0){
                    this.errorHandling(res, "deposit", ["Conta/agência não encontrada!"]);
                    return
                }

                currentBalance = results[0].balance + req.jsonBody.valor;

                await this.dbInstance.updateOne("accounts", queryFields, {balance: currentBalance}); 

                responseBody = {
                    sucess : true,
                    message : "Depósito realizado com sucesso!",
                    currentBalance: currentBalance
                }

                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
                });

                res.end(JSON.stringify(responseBody));  
                return
            } catch (err) {
                console.log(err);

                this.errorHandling(res, "deposit", [`Não foi possível realizar o depósito devido ao seguinte erro: ${err}`]);   
                return(err);
            }
    }

    retrieval = async (req, res) => {
        let responseBody = {};
        let validation = {};
        let currentBalance = 0;

        validation = Private.validateRequestBody(req, res);

        if(!validation.valid){
            this.errorHandling(res, "jsonBodyValidation", validation.errorList);
            return
        }

        const validationOptions = {
            validateAgency: true,
            validateAccount: true,
            validateAmount: true
        }

        validation = Private.validateInformation(req.jsonBody, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "jsonBodyInformation", validation.errorList);
            return
        }

        try {
            const queryFields = {
                agencia: req.jsonBody.agencia,
                conta: req.jsonBody.conta
            }

            const results = await this.dbInstance.query("accounts", queryFields);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "retrieval", ["Conta/agência não encontrada!"]);
                return
            }

            currentBalance = results[0].balance - req.jsonBody.valor - 1;

            if(currentBalance < 0){
                this.errorHandling(res, "retrieval", ["Saldo insuficiente para o saque!"]);
                return
            }

            await this.dbInstance.updateOne("accounts", queryFields, {balance: currentBalance}); 

            responseBody = {
                sucess : true,
                message : "Saque realizado com sucesso!", 
                currentBalance: currentBalance
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "retrieval", [`Não foi possível realizar o saque devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    checkBalance = async (req, res) => {
        let responseBody = {};
        let validation = {};
        let currentBalance = 0;

        const validationOptions = {
            validateAgency: true,
            validateAccount: true,
            queryParams: true
        }

        const dataObject = {
            agencia: req.query.agencia,
            conta: req.query.conta
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try {
            const queryFields = {
                agencia: parseInt(req.query.agencia),
                conta: parseInt(req.query.conta)
            }

            const results = await this.dbInstance.query("accounts", queryFields);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "checkBalance", ["Conta/agência não encontrada!"]);
                return
            }

            responseBody = { 
                sucess : true,
                message : "Consulta realizada com sucesso!", 
                agency: results[0].agencia,
                account: results[0].conta, 
                name: results[0].name, 
                currentBalance: results[0].balance 
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "checkBalance", [`Não foi possível consultar o saldo devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    deleteAccount = async (req, res) => {
        let responseBody = {};
        let validation = {};

        const validationOptions = {
            validateAgency: true,
            validateAccount: true,
            queryParams: true
        }

        const dataObject = {
            agencia: req.query.agencia,
            conta: req.query.conta
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try {
            const queryFields = {
                agencia: parseInt(req.query.agencia),
                conta: parseInt(req.query.conta)
            }

            const results = await this.dbInstance.query("accounts", queryFields);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "deleteAccount", ["Conta/agência não encontrada para ser excluída!"]);
                return
            }

            await this.dbInstance.deleteOne("accounts", queryFields);

            responseBody = {  
                sucess : true,
                message : "Conta excluída com sucesso!"
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "deleteAccount", [`Não foi possível excluir a conta devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    transferBalance = async (req, res) => {
        let responseBody = {};
        let validation = {};
        let originAccountNewBalance = 0;
        let destinationAccountNewBalance = 0;
        let dataObject = {};
        let validationOptions = {};

        validation = Private.validateRequestBody(req, res);

        if(!validation.valid){
            this.errorHandling(res, "jsonBodyValidation", validation.errorList);
            return
        }

        validationOptions = {
            validateAmount: true
        }

        dataObject = {
            valor: req.jsonBody.valor
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        console.log("Validacao 1 de 3 - TransferBalance");
        if(!validation.valid){
            this.errorHandling(res, "jsonBodyInformation", validation.errorList);
            return
        }

        validationOptions = {
            validateAgency: true,
            validateAccount: true,
            toFromValidation: "from"
        }

        dataObject = {
            agencia: req.jsonBody.from.agencia,
            conta: req.jsonBody.from.conta
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        console.log("Validacao 2 de 3 - TransferBalance");
        if(!validation.valid){
            this.errorHandling(res, "jsonBodyInformation", validation.errorList);
            return
        }

        validationOptions = {
            validateAgency: true, 
            validateAccount: true, 
            toFromValidation: "to"
        }

        dataObject = {
            agencia: req.jsonBody.to.agencia,
            conta: req.jsonBody.to.conta
        }

        validation = Private.validateInformation(dataObject, validationOptions);  

        console.log("Validacao 3 de 3 - TransferBalance");
        if(!validation.valid){
            this.errorHandling(res, "jsonBodyInformation", validation.errorList);
            return
        }

        try {
            let queryFieldsOrigin = {
                agencia: req.jsonBody.from.agencia,
                conta: req.jsonBody.from.conta
            }

            let queryFieldsDestination = {
                agencia: req.jsonBody.to.agencia,
                conta: req.jsonBody.to.conta
            }

            let results = await this.dbInstance.query("accounts", queryFieldsOrigin);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "transferBalance", ["Conta/agência de origem não encontrada!"]);
                return;
            }

            originAccountNewBalance = results[0].balance - req.jsonBody.valor; 

            if(req.jsonBody.from.agencia !== req.jsonBody.to.agencia){
                originAccountNewBalance -= 8;
            }

            if(originAccountNewBalance < 0){
                this.errorHandling(res, "transferBalance", ["Saldo da conta de origem insuficiente para a transferência!"]);
                return;
            }

            results = await this.dbInstance.query("accounts", queryFieldsDestination);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "transferBalance", ["Conta/agência de destino não encontrada!"]);
                return;
            }

            destinationAccountNewBalance = results[0].balance + req.jsonBody.valor;

            await this.dbInstance.updateOne("accounts", queryFieldsOrigin, {balance: originAccountNewBalance}); 

            await this.dbInstance.updateOne("accounts", queryFieldsDestination, {balance: destinationAccountNewBalance}); 

            responseBody = {
                sucess : true,
                message : `Transferência no valor de ${req.jsonBody.valor} realizada com sucesso!`, 
                from: {
                    agency: req.jsonBody.from.agencia,
                    account: req.jsonBody.from.conta,
                    newBalance: originAccountNewBalance
                },
                to: {
                    agency: req.jsonBody.to.agencia,
                    account: req.jsonBody.to.conta,
                    newBalance: destinationAccountNewBalance
                }
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "transferBalance", [`Não foi possível realizar a transferência entre contas devido ao devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    averageBalance = async (req, res) => {
        let responseBody = {};
        let validation = {};
        let totalBalance = 0;

        const validationOptions = {
            validateAgency: true,
            queryParams: true
        }

        const dataObject = {
            agencia: req.query.agencia
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try {
            const queryFields = {
                agencia: parseInt(req.query.agencia) 
            };

            const results = await this.dbInstance.query("accounts", queryFields);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "averageBalance", ["Nenhuma conta encontrada para a agência informada!"]);
                return
            }

            for(let account of results){
                totalBalance += account.balance;
            }

            console.log(`Saldo de todas as contas: ${totalBalance}`);
            console.log(`Quantidade de contas: ${results.length }`);

            responseBody = { 
                sucess : true,
                message : "Consulta de média de saldos realizada com sucesso!", 
                averageBalance: totalBalance / results.length 
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "checkBalance", [`Não foi possível consultar o saldo devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    poorestClients = async (req, res) => {
        let responseBody = {};
        let validation = {};
        let totalBalance = 0;

        const validationOptions = {
            validateAmount: true,
            queryParams: true
        }

        const dataObject = {
            valor: req.query.valor
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try { 
            const queryFields =  {};      

            const queryOptions = {
                projection : {
                    "_id" : 0
                },
                sort: {
                    balance: 1 
                },
                limit: parseInt(req.query.valor) 
            }

            const results = await this.dbInstance.query("accounts", queryFields, queryOptions);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "poorestClients", ["Nenhuma conta encontrada!"]);
                return
            }

            responseBody = { 
                sucess : true,
                message : `Consulta dos ${req.query.valor} clientes com menor saldo realizada com sucesso!`, 
                clientList: results 
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "poorestClients", [`Não foi possível consultar os clientes com menor saldo devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    richestClients = async (req, res) => {
        let responseBody = {};
        let validation = {};

        const validationOptions = {
            validateAmount: true,
            queryParams: true
        }

        const dataObject = {
            valor: req.query.valor
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try { 
            const queryFields =  {};      

            const queryOptions = {
                projection : {
                    "_id" : 0
                },
                sort: {
                    balance: -1 
                },
                limit: parseInt(req.query.valor) 
            }

            const results = await this.dbInstance.query("accounts", queryFields, queryOptions);  

            console.log(results);

            if(results.length == 0){
                this.errorHandling(res, "richestClients", ["Nenhuma conta encontrada!"]);
                return
            }

            responseBody = { 
                sucess : true,
                message : `Consulta dos ${req.query.valor} clientes com maior saldo realizada com sucesso!`, 
                clientList: results 
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "richestClients", [`Não foi possível consultar os clientes com maior saldo devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    transferToPrivateAgency = async (req, res) => { 
        let responseBody = {};
        let promiseList = [];
        
        try {  
            const agencies = await this.dbInstance.distinctQuery("accounts", "agencia",  {agencia: {$ne: 99}});    

            if(agencies.length === 0){
                this.errorHandling(res, "transferToPrivateAgency", ["Nenhuma agência encontrada!"]);
                return
            }

            for(let i = 0; i < agencies.length; i++){
                const queryFields = {
                    $and: [
                        {
                            agencia: agencies[i]
                        },
                        {
                            agencia: {
                                $ne: 99 
                            }
                        }
                    ]
                };

                
                const queryOptions = { 
                    sort: {
                        balance: -1 
                    },
                    limit: 1 
                }   

                promiseList.push(this.dbInstance.query("accounts", queryFields, queryOptions));
            }

            const idList = await Promise.all(promiseList);  

            if(idList.length === 0){
                this.errorHandling(res, "transferToPrivateAgency", ["Não foram encontrados clientes para transferência de agência!"]);
                return 
            }

            promiseList.length = 0;

            for(let i = 0; i < idList.length; i++){          
                const queryFields = { 
                    _id : idList[i][0]._id 
                };

                promiseList.push(this.dbInstance.updateOne("accounts", queryFields, {agencia: 99}));  
            }

            await Promise.all(promiseList);

            const queryFields =  {
                agencia: 99
            };      

            const queryOptions = {
                projection : {
                    _id : 0
                } 
            }

            const results = await this.dbInstance.query("accounts", queryFields, queryOptions); 

            responseBody = { 
                sucess : true, 
                message : `Transferência do cliente de maior saldo de cada agência para a agência privada realizada com sucesso! Há atualmente ${results.length} clientes na agência privada!`,  
                clientList: results
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "transferToPrivateAgency", [`Não foi possível transferir o cliente de maior saldo de cada agência para a agência privada devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    errorHandling = (res, errorStringCode, errorList) => {
        let responseBody = {};

        if(errorStringCode === "jsonBodyValidation"){
            const sucess = false;
            const message = "Um ou mais erros ocorreram ao validar a requisição"; 
 
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "jsonBodyInformation"){
            const sucess = false;
            const message = "Um ou mais erros ocorreram em relação às informações enviadas";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "queryParamsInformation"){
            const sucess = false;
            const message = "Um ou mais erros ocorreram em relação às informações enviadas via query parameters";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "deposit"){
            const sucess = false;
            const message = "Erro ao realizar o depósito!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "retrieval"){
            const sucess = false;
            const message = "Erro ao realizar o saque!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "checkBalance"){
            const sucess = false;
            const message = "Erro ao consultar saldo!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "deleteAccount"){
            const sucess = false;
            const message = "Erro ao excluir conta!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "transferBalance"){
            const sucess = false;
            const message = "Erro ao transferir saldo entre contas!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "averageBalance"){
            const sucess = false;
            const message = "Erro ao consultar média de saldo entre contas da agência!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "poorestClients"){
            const sucess = false;
            const message = "Erro ao consultar os clientes com menor saldo da agência!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "richestClients"){
            const sucess = false;
            const message = "Erro ao consultar os clientes com maior saldo da agência!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "transferToPrivateAgency"){
            const sucess = false;
            const message = "Erro ao transferir o cliente com maior saldo de cada agência para a agência privada!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }

        res.end(JSON.stringify(responseBody));
    }
}

class Private {
    constructor() {}

    static validateRequestBody(req) {
        let valid = true;
        let errorList = [];
        let jsonBody = {};
    
        if (req.headers['content-type']) {
            if (req.headers['content-type'] === 'application/json') {
                try {
                    jsonBody = JSON.parse(req.body);
                    req.jsonBody = jsonBody;
                } catch (err) {
                    valid = false;
                    errorList.push(`O json enviado é inválido! O seguinte erro aconteceu ao processá-lo: ${err}`);
                }
            } else {
                valid = false;
                errorList.push("Cabeçalho Content-Type com valor diferente de application/json");
            }
        } else {
            valid = false;
            errorList.push("Cabeçalho Content-Type não informado");
        }

        return {valid, errorList};
    }

    static validateInformation(dataObject, validationOptionsObject) {
        let valid = true;
        let errorList = [];

        if (!dataObject) {
            valid = false;
            errorList.push(`As informações necessárias não foram informadas!`);
        } else {
            if (validationOptionsObject.validateAgency) {
                const typeOfAgency = typeof dataObject.agencia;

                if (!dataObject.agencia) {
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Não foi informada a chave "agencia"!`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Não foi informada a chave "agencia" dentro da chave "from"!`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Não foi informada a chave "agencia" dentro da chave "to"!`);
                    }
                    
                } else if (typeOfAgency !== "number" && !validationOptionsObject.queryParams) {
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Tipo incorreto para a chave "agencia"! Esperado: número, Enviado: ${typeOfAgency}`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Tipo incorreto para a chave "agencia" dentro da chave "from"! Esperado: número, Enviado: ${typeOfAgency}`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Tipo incorreto para a chave "agencia" dentro da chave "to"! Esperado: número, Enviado: ${typeOfAgency}`);
                    }
                }
            }

            if (validationOptionsObject.validateAccount) {
                const typeOfAccount = typeof dataObject.conta;

                if (!dataObject.conta) {
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Não foi informada a chave "conta"!`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Não foi informada a chave "conta" dentro da chave "from"!`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Não foi informada a chave "conta" dentro da chave "to"!`);
                    }
                } else if (typeOfAccount !== "number" && !validationOptionsObject.queryParams) {
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Tipo incorreto para a chave "conta"! Esperado: número, Enviado: ${typeOfAccount}`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Tipo incorreto para a chave "conta" dentro da chave "from"! Esperado: número, Enviado: ${typeOfAccount}`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Tipo incorreto para a chave "conta" dentro da chave "to"! Esperado: número, Enviado: ${typeOfAccount}`);
                    }
                    
                }
            }

            if (validationOptionsObject.validateAmount) {
                const typeOfAmount = typeof dataObject.valor;

                if (!dataObject.valor) {
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Não foi informada a chave "valor"!`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Não foi informada a chave "valor" dentro da chave "from"!`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Não foi informada a chave "valor" dentro da chave "to"!`);
                    }
                } else if (typeOfAmount !== "number" && !validationOptionsObject.queryParams) { 
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Tipo incorreto para a chave "valor"! Esperado: number, Enviado: ${typeOfAmount}`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Tipo incorreto para a chave "valor" dentro da chave "from"! Esperado: number, Enviado: ${typeOfAmount}`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Tipo incorreto para a chave "valor" dentro da chave "to"! Esperado: number, Enviado: ${typeOfAmount}`);
                    }
                } else if (dataObject.valor < 0){
                    valid = false;

                    if(!dataObject.toFromValidation){
                        errorList.push(`Valor informado para a chave "valor" é negativo!`);
                    }else if(dataObject.toFromValidation === "from"){
                        errorList.push(`Valor informado para a chave "valor" dentro da chave "from" é negativo!`);
                    }else if(dataObject.toFromValidation === "to"){
                        errorList.push(`Valor informado para a chave "valor" dentro da chave "to" é negativo!`);
                    }
                }
            }
        }

        return { valid, errorList };
    }
}