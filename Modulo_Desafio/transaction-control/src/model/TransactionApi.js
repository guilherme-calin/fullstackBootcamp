import File from './File.js'
import Database from './Database.js'

export default class TransactionApi{
    dbInstance;
    frontEndHost;

    constructor(frontEndHost){
        this.dbInstance = new Database(process.env.DB_CONNECTION);
        this.frontEndHost = frontEndHost;
    }

    prepareApplication = (filePath) => {
        return new Promise(async (resolve, reject) => {
            try {
                const collections = await this.dbInstance.checkAllCollections();
                const transactionCollection = "transactions"
    
                let collectionExists = false;
        
                for(let collection of collections) {
                    if(collection.name === transactionCollection){
                        collectionExists = true;
                        break;
                    }
                }
        
                if(collectionExists) {
                    await this.dbInstance.dropCollection(transactionCollection);
                }
        
                const validator = {
                    validator: {
                        $jsonSchema: {
                            bsonType: "object",
                            required: ["description", "value", "category", "year","month","day","yearMonth","yearMonthDay","type"],
                            properties: {
                                description: {
                                    bsonType: "string",
                                    description: "Descrição da transação"
                                },
                                value: {
                                    bsonType: "int",
                                    description: "Valor da transação em módulo"
                                },
                                category: {
                                    bsonType: "string",
                                    description: "Categoria da transação"
                                },
                                year: {
                                    bsonType: "int", 
                                    description: "Ano referente à transação" 
                                },
                                month: {
                                    bsonType: "int", 
                                    description: "Mês referente à transação" 
                                },
                                day: {
                                    bsonType: "int", 
                                    description: "Dia referente à transação" 
                                },
                                yearMonth: {
                                    bsonType: "string", 
                                    description: "String com o ano e mês referente à transação" 
                                },
                                yearMonthDay: {
                                    bsonType: "string", 
                                    description: "String com o dia, mês e ano referente à transação" 
                                },
                                type: {
                                    bsonType: "string", 
                                    description: "Indica se a transação é despesa ou receita" 
                                }
                            }
                        }
                    }
                }
        
                await this.dbInstance.createCollection(transactionCollection, validator);
           
                const transactionFileContent = await File.getJSON(filePath); 
        
                let bulkOperation = [];
        
                for(let account of transactionFileContent){
                    bulkOperation.push({insertOne: {document: account}});
                }
         
                await this.dbInstance.bulkWrite(transactionCollection, bulkOperation);
            
                resolve("Aplicação inicializada com sucesso!");
            }catch(err) {  
                await this.dbInstance.closeConnection();
    
                reject(`Ocorreu o seguinte erro ao inicializar a aplicação: ${err}`); 
            }
        });
    }

    createTransaction = async (req, res) => {
            let responseBody = {};
            let validation = {};
            const collectionName = "transactions";
            
            validation = Private.validateRequestBody(req, res);

            if(!validation.valid){
                this.errorHandling(res, "jsonBodyValidation", validation.errorList);
                return
            }

            const validationOptions = {
                description: true,
                value: true,
                category: true,
                year: true,
                month: true,
                day: true,
                yearMonth: true,
                yearMonthDay: true,
                type: true
            }

            validation = Private.validateInformation(req.jsonBody, validationOptions); 

            if(!validation.valid){
                this.errorHandling(res, "jsonBodyInformation", validation.errorList);
                return
            }

            try {
                const {description, value, category, year, month, day, yearMonth, yearMonthDay, type} = req.jsonBody;
                let document = {
                    description,
                    value,
                    category,
                    year,
                    month,
                    day,
                    yearMonth,
                    yearMonthDay,
                    type
                }

                await this.dbInstance.insertOne(collectionName, document); 

                responseBody = {
                    sucess : true,
                    message : "Transação inserida com sucesso!",
                    transaction: document
                }

                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin" : "*", 
                    "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
                });

                res.end(JSON.stringify(responseBody));  
                return
            } catch (err) {
                console.log(err);

                this.errorHandling(res, "createTransaction", [`Não foi possível realizar a inclusão da transação devido ao seguinte erro: ${err}`]);   
                return(err);
            }
    }

    getTransaction = async (req, res) => {
        let responseBody = {};
        let validation = {};
        const collectionName = "transactions";

        const validationOptions = {
            id: true,
            description: true,
            yearMonth: true,
            queryParams: true
        }

        const dataObject = {
            id: req.query.id,
            description: req.query.description,
            yearMonth: req.query.yearMonth
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try {
            let queryFilter = {};
            
            if(req.query.id){
                queryFilter._id = req.query.id;
            } else if (req.query.description){
                queryFilter.description = {
                    $regex : `.*${req.query.description}.*`,
                    $options : "i"
                }
            } else if (req.query.yearMonth){
                queryFilter.yearMonth = req.query.yearMonth;
            }

            const results = await this.dbInstance.query(collectionName, queryFilter);  

            let debtValue = 0;
            let creditValue = 0;
            let totalBalance = 0;

            for(let transaction of results){
                if(transaction.type === "+"){
                    creditValue += transaction.value;
                    totalBalance += transaction.value;
                }else{
                    debtValue += transaction.value;
                    totalBalance -= transaction.value;
                }
            }
            
            responseBody = { 
                sucess : true,
                message : "Consulta realizada com sucesso!",
                transactionsFound : results.length,
                debtValue,
                creditValue,
                totalBalance,
                transactions : results 
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : this.frontEndHost, 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "getTransaction", [`Não foi possível realizar a consulta de transações devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    getYearList = async (req, res) => {   
        let responseBody = {};
        let validation = {};
        const collectionName = "transactions";
        const fieldName = "year"

        try {
            let queryFilter = {};
            
            const results = await this.dbInstance.distinctQuery(collectionName, fieldName, queryFilter);  
            
            responseBody = { 
                sucess : true,
                message : "Consulta da lista de anos disponíveis realizada com sucesso!",
                yearList : results
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : this.frontEndHost, 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));   
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "getYearList", [`Não foi possível consultar a lista de anos disponíveis devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    updateTransaction = async (req,res) => {
        let responseBody = {};
        let validation = {};
        const collectionName = "transactions";

        console.log("Chegou no update!");

        validation = Private.validateRequestBody(req, res);

        if(!validation.valid){
            this.errorHandling(res, "jsonBodyValidation", validation.errorList);
            return
        }

        const validationOptions = {
            id: true
        }

        Private.mutateValidationObject(req.jsonBody, validationOptions);

        validation = Private.validateInformation(req.jsonBody, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "jsonBodyInformation", validation.errorList);
            return
        }

        try {
            const queryField = {
                _id : req.jsonBody.id
            }

            let fieldsToUpdate = {}
            let updateOptions = {
                returnOriginal : false
            }

            for(let prop in validationOptions){
                if(validationOptions.hasOwnProperty(prop) && prop !== "id"){
                    fieldsToUpdate[prop] = req.jsonBody[prop];
                }
            }

            if(fieldsToUpdate.yearMonthDay){
                let splitArray = fieldsToUpdate.yearMonthDay.split("-");
                let yearMonth = `${splitArray[0]}-${splitArray[1]}`;
                let yearAsNumber = Number.parseInt(splitArray[0]);
                let monthAsNumber = Number.parseInt(splitArray[1]);
                let dayAsNumber = Number.parseInt(splitArray[2]);

                fieldsToUpdate.year = yearAsNumber;
                fieldsToUpdate.month = monthAsNumber;
                fieldsToUpdate.day = dayAsNumber;
                fieldsToUpdate.yearMonth = yearMonth;
            }


            const result = await this.dbInstance.findOneAndUpdate(collectionName, queryField, fieldsToUpdate, updateOptions);  

            console.log(result);

            if(!result.value){
                this.errorHandling(res, "updateTransaction", ["Transação não encontrada para ser atualizada!"]);
                return
            }

            responseBody = {  
                sucess : true,
                message : "Transação atualizada com sucesso!",
                transaction : result.value
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*",
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "updateTransaction", [`Não foi possível atualizar a transação devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }

    deleteTransaction = async (req,res) => {
        let responseBody = {};
        let validation = {};
        const collectionName = "transactions";
        
        const validationOptions = {
            id: true,
            queryParams: true
        }

        const dataObject = {
            id: req.query.id
        }

        validation = Private.validateInformation(dataObject, validationOptions); 

        if(!validation.valid){
            this.errorHandling(res, "queryParamsInformation", validation.errorList);
            return
        }

        try {
            const queryFields = {
                _id : req.query.id
            }

            const result = await this.dbInstance.findOneAndDelete(collectionName, queryFields);  

            console.log(result);

            if(!result.value){
                this.errorHandling(res, "deleteTransaction", ["Transação não encontrada para ser excluída!"]);
                return
            }

            responseBody = {  
                sucess : true,
                message : "Transação excluída com sucesso!",
                transaction : result.value
            }

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*", 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });

            res.end(JSON.stringify(responseBody));  
            return
        } catch (err) {
            console.log(err);

            this.errorHandling(res, "deleteTransaction", [`Não foi possível excluir a conta devido ao seguinte erro: ${err}`]);   
            return(err);
        }
    }
    
    errorHandling = (res, errorStringCode, errorList) => {
        let responseBody = {};

        if(errorStringCode === "jsonBodyValidation") {
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
                "Access-Control-Allow-Origin" : "*", 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "jsonBodyInformation") {
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
                "Access-Control-Allow-Origin" : "*", 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "queryParamsInformation") {
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
                "Access-Control-Allow-Origin" : "*", 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "createTransaction") {
            const sucess = false;
            const message = "Erro ao registrar a transação!";
            
            responseBody = {
                sucess,
                error : {
                    message,
                    errorList
                }
            }

            res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*", 
                "Content-Length": Buffer.from(JSON.stringify(responseBody)).length
            });
        }else if(errorStringCode === "getTransaction") {
            const sucess = false;
            const message = "Erro ao realizar consulta de transações!";
            
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
        }else if(errorStringCode === "getYearList") {
            const sucess = false;
            const message = "Erro ao realizar consulta da lista de anos disponíveis!";
            
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
        else if(errorStringCode === "updateTransaction") {
            const sucess = false;
            const message = "Erro ao atualizar a transação!";
            
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
        }else if(errorStringCode === "deleteTransaction") {
            const sucess = false;
            const message = "Erro ao realizar a exclusão da transação!";
            
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
            if(validationOptionsObject.queryParams){
                if (dataObject.id && validationOptionsObject.id) {
                    const typeOfId = typeof dataObject.id;

                    if (typeOfId !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave "id"! Esperado: string, Enviado: ${typeOfDescription}.`);                                                             
                    }
                } else if (dataObject.description && validationOptionsObject.description) {
                    const typeOfDescription = typeof dataObject.description;

                    if (typeOfDescription !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave "description"! Esperado: string, Enviado: ${typeOfDescription}.`);                                                             
                    }
                } else if (dataObject.yearMonth && validationOptionsObject.yearMonth) {
                    const typeOfYearMonth = typeof dataObject.yearMonth;
    
                    if (typeOfYearMonth !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'yearMonth'! Esperado: string, Enviado: ${typeOfYearMonth}.`);                                                            
                    } else { 
                        const splitKey = dataObject.yearMonth.split("-");
    
                        if (splitKey.length !== 2){
                            valid = false;
     
                            errorList.push(`Formato incorreto enviado para a chave 'yearMonth'! O formato deve ser 'YYYY-MM'!`); 
                        } else if (splitKey[0].length !== 4 || splitKey[1].length !== 2) {
                            valid = false;
     
                            errorList.push(`Valor inválido enviado para a chave 'yearMonth'! O ano deve possuir 4 dígitos e o mês deve possuir 2 dígitos conforme formato 'YYYY-MM'.`); 
                        }
                    }
                } else {
                    valid = false;

                    let message = "Não foi informada nenhuma chave de busca via query parameters. A(s) chave(s) necessária(s) é/são: "
                    
                    if(validationOptionsObject.id){
                        message += "id;"
                    }

                    if(validationOptionsObject.description){
                        message += "description;"
                    }

                    if(validationOptionsObject.yearMonth){
                        message += "yearMonth;"
                    }

                    errorList.push(message);                                                             
                }

                
            }else{
                if (validationOptionsObject.id) {
                    const typeOfId = typeof dataObject.id;

                    if (!dataObject.id) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave "id"!`);           
                    } else if (typeOfId !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave "id"! Esperado: string, Enviado: ${typeOfDescription}.`);                                                             
                    }
                }

                if (validationOptionsObject.description) {
                    const typeOfDescription = typeof dataObject.description;
    
                    if (!dataObject.description) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave "description"!`);           
                    } else if (typeOfDescription !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave "description"! Esperado: string, Enviado: ${typeOfDescription}.`);                                                             
                    }
                }
    
                if (validationOptionsObject.value) {
                    const typeOfValue = typeof dataObject.value;
    
                    if (!dataObject.value) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'value'!`);           
                    } else if (typeOfValue !== "number") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'value'! Esperado: number, Enviado: ${typeOfValue}.`);                                                            
                    } else if (dataObject.value < 0) {
                        valid = false;
     
                        errorList.push(`Valor negativo enviado para a chave 'value'! O número deve ser positivo, e a chave 'type' deve ser utilizada para definir se é uma despesa ou receita.`);                                                            
                    }
                }
    
                if (validationOptionsObject.category) {
                    const typeOfCategory = typeof dataObject.category;
    
                    if (!dataObject.category) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'category'!`);           
                    } else if (typeOfCategory !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'category'! Esperado: string, Enviado: ${typeOfCategory}.`);                                                            
                    } 
                }
    
                if (validationOptionsObject.year) {
                    const typeOfYear = typeof dataObject.year;
    
                    if (!dataObject.year) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'year'!`);           
                    } else if (typeOfYear !== "number") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'year'! Esperado: number, Enviado: ${typeOfYear}.`);                                                            
                    } 
                }
    
                if (validationOptionsObject.month) {
                    const typeOfMonth = typeof dataObject.month;
    
                    if (!dataObject.month) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'month'!`);           
                    } else if (typeOfMonth !== "number") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'month'! Esperado: number, Enviado: ${typeOfMonth}.`);                                                            
                    } 
                }
    
                if (validationOptionsObject.day) {
                    const typeOfDay = typeof dataObject.day;
    
                    if (!dataObject.day) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'day'!`);           
                    } else if (typeOfDay !== "number") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'day'! Esperado: number, Enviado: ${typeOfDay}.`);                                                            
                    } 
                }
    
                if (validationOptionsObject.yearMonth) {
                    const typeOfYearMonth = typeof dataObject.yearMonth;
    
                    if (!dataObject.yearMonth) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'yearMonth'!`);           
                    } else if (typeOfYearMonth !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'yearMonth'! Esperado: string, Enviado: ${typeOfYearMonth}.`);                                                            
                    } else { 
                        const splitKey = dataObject.yearMonth.split("-");
    
                        if (splitKey.length !== 2){
                            valid = false;
     
                            errorList.push(`Formato incorreto enviado para a chave 'yearMonth'! O formato deve ser 'YYYY-MM'!`); 
                        } else if (splitKey[0].length !== 4 || splitKey[1].length !== 2) {
                            valid = false;
     
                            errorList.push(`Valor inválido enviado para a chave 'yearMonth'! O ano deve possuir 4 dígitos e o mês deve possuir 2 dígitos conforme formato 'YYYY-MM'.`); 
                        } else{
                            let patternForYear = new RegExp("[0-9]{4}");
                            let patternForMonth = new RegExp("[0-9]{2}");

                            if(!patternForYear.test(splitKey[0])){
                                valid = false;
     
                                errorList.push(`Valor inválido informado para o ano na chave 'yearMonth'! Apenas caracteres de 0 a 9 são permitidos!.`); 
                            }

                            if(!patternForMonth.test(splitKey[1])){
                                valid = false;
     
                                errorList.push(`Valor inválido informado para o mês na chave 'yearMonth'! Apenas caracteres de 0 a 9 são permitidos!.`); 
                            }
                        }
                    }
                }
    
                if (validationOptionsObject.yearMonthDay) {
                    const typeOfYearMonthDay = typeof dataObject.yearMonthDay;
    
                    if (!dataObject.yearMonthDay) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'yearMonthDay'!`);           
                    } else if (typeOfYearMonthDay !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'yearMonthDay'! Esperado: string, Enviado: ${typeOfYearMonthDay}.`);                                                            
                    } else { 
                        const splitKey = dataObject.yearMonthDay.split("-");
    
                        if (splitKey.length !== 3){
                            valid = false;
     
                            errorList.push(`Formato incorreto enviado para a chave 'yearMonthDay'! O formato deve ser 'YYYY-MM-DD'!`); 
                        } else if (splitKey[0].length !== 4 || splitKey[1].length !== 2 || splitKey[2].length !== 2) {
                            valid = false;
     
                            errorList.push(`Valor inválido enviado para a chave 'yearMonthDay'! O ano deve possuir 4 dígitos, o mês deve possuir 2 dígitos e o dia deve possuir 2 dígitos, conforme formato 'YYYY-MM-DD'.`); 
                        } else{
                            let patternForYear = new RegExp("[0-9]{4}");
                            let patternForMonthAndDay = new RegExp("[0-9]{2}");

                            if(!patternForYear.test(splitKey[0])){
                                valid = false;
     
                                errorList.push(`Valor inválido informado para o ano na chave 'yearMonthDay'! Apenas caracteres de 0 a 9 são permitidos!.`); 
                            }

                            if(!patternForMonthAndDay.test(splitKey[1])){
                                valid = false;
     
                                errorList.push(`Valor inválido informado para o mês na chave 'yearMonthDay'! Apenas caracteres de 0 a 9 são permitidos!.`); 
                            }

                            if(!patternForMonthAndDay.test(splitKey[2])){
                                valid = false;
     
                                errorList.push(`Valor inválido informado para o dia na chave 'yearMonthDay'! Apenas caracteres de 0 a 9 são permitidos!.`); 
                            }
                        }
                    }
                }
    
                if (validationOptionsObject.type) {
                    const typeOfType = typeof dataObject.type;
    
                    if (!dataObject.type) {
                        valid = false;
    
                        errorList.push(`Não foi informada a chave 'type'!`);           
                    } else if (typeOfType !== "string") {
                        valid = false;
     
                        errorList.push(`Tipo incorreto para a chave 'type'! Esperado: string, Enviado: ${typeOfType}.`);                                                            
                    } else if (dataObject.type !== "+" && dataObject.type !== "-") { 
                        valid = false;
     
                        errorList.push(`Formato incorreto enviado para a chave 'type'! Os valores possíveis são '+' e '-'!`);   
                    } 
                }
            }
        }

        return { valid, errorList };
    }

    static mutateValidationObject(jsonBody, validationObject){
        if(jsonBody.description){
            validationObject.description = true
        }

        if(jsonBody.value){
            validationObject.value = true
        }

        if(jsonBody.category){
            validationObject.category = true
        }

        if(jsonBody.yearMonthDay){
            validationObject.yearMonthDay = true
        }

        return
    }
}