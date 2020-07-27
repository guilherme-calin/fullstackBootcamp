import mongodb from 'mongodb'

export default class Database{
    client;

    constructor(connectionString){
        this.client = new mongodb.MongoClient(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});
    }

    closeConnection = () => {
        return new Promise(async (resolve, reject) => {
            try {
                await this.client.close();
                resolve(true);
            }catch(err) {
                reject(err)
            }
        })
    }

    checkAllCollections = () => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }
           
            this.client.db().listCollections({},{nameOnly: true}).toArray().then(array => {
                resolve(array);
            }).catch(async err => {
                reject(err);
            });

        })
    }

    getCollection = (collectionName) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }


            const collection = this.client.db().collection(collectionName);
            resolve(collection);
        })
    }

    createCollection = (collectionName, validator) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            this.client.db().createCollection(collectionName, validator).then(result => {
                resolve(result);
            }).catch(async err => {
                reject(err);
            });  
        })
    }

    dropCollection = (collectionName) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            this.client.db().collection(collectionName).drop().then(async result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    bulkWrite = (collectionName, operations) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            this.client.db().collection(collectionName).bulkWrite(operations).then(result => {
                resolve(result);
            }).catch(async err => {
                reject(err);
            });
        });
    }

    query = (collectionName, filter, options) => { 
        let projectionObject = {};

        if(options){
            if(options.projection){
                projectionObject = {projection : options.projection};
            }
        }

        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            try{
                if(filter._id){
                    const idString = filter._id;
                    const idAsObjectId = new mongodb.ObjectId(idString);

                    filter._id = idAsObjectId;
                }
                
                let results = this.client.db().collection(collectionName).find(filter, projectionObject);  

                if(options){
                    if(options.sort){
                        results = results.sort(options.sort); 
                    }
                    if(options.limit){
                        results = results.limit(options.limit);
                    }
                } 

                const resultsArray = await results.toArray(); 
                resolve(resultsArray);
            }catch(err){ 
                reject(err);
            }
        });
    }

    distinctQuery = (collectionName, keyFieldName, queryFields) => { 
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }


            this.client.db().collection(collectionName).distinct(keyFieldName, queryFields).then(async results => {
                resolve(results); 
            }).catch(err => {
                reject(err);
            });  
        });
    }

    insertOne = (collectionName, document) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            try{
                const collection = await this.getCollection(collectionName);

                if(collection){
                    collection.insertOne(document).then(result => {
                        resolve(result);
                    }).catch(async err => {
                        reject(err);
                    });  
                } else {
                    throw `Coleção ${collectionName} não encontrada! Não foi possível inserir o registro!`
                }
            }catch (err) {
                reject(err);
            }
        })
    }

    updateOne = (collectionName, filter, updateObject) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            this.client.db().collection(collectionName).updateOne(filter, {$set : updateObject}).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    findOneAndUpdate = (collectionName, filter, updateObject, options) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            if(filter._id){
                const idString = filter._id;
                const idAsObjectId = new mongodb.ObjectId(idString);

                filter._id = idAsObjectId;
            }

            console.log(options);

            this.client.db().collection(collectionName).findOneAndUpdate(filter, {$set : updateObject}, options).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    deleteOne = (collectionName, filter) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            this.client.db().collection(collectionName).deleteOne(filter).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    findOneAndDelete = (collectionName, filter) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                try{
                    await this.client.connect(); 
                }catch(err){
                    reject(err);
                }
            }

            if(filter._id){
                const idString = filter._id;
                const idAsObjectId = new mongodb.ObjectId(idString);

                filter._id = idAsObjectId;
            }

            this.client.db().collection(collectionName).findOneAndDelete(filter).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}