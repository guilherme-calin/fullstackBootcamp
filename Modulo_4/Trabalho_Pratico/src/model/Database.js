import mongodb from 'mongodb'

export default class Database{
    client;

    constructor(connectionString){
        this.client = new mongodb.MongoClient(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});
    }

    closeConnection = async () => {
        await this.client.close();
    }

    checkAllCollections = () => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect(); 
            }
           
            this.client.db().listCollections({},{nameOnly: true}).toArray().then(array => {
                resolve(array);
            }).catch(async err => {
                await this.client.close();
                reject(err);
            });

        })
    }

    getCollection = (collectionName) => {
        return new Promise((resolve, reject) => {
            this.client.connect().then(client => {
                const collection = client.db().collection(collectionName);
                resolve(collection);
            }).catch(async err => {
                await client.close();
                reject(err);
            });
        })
    }

    createCollection = (collectionName, validator) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }

            this.client.db().createCollection(collectionName, validator).then(result => {
                resolve(result);
            }).catch(async err => {
                this.client.close();
                reject(err);
            });  
        })
    }

    dropCollection = (collectionName) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }

            this.client.db().collection(collectionName).drop().then(async result => {
                console.log(result);
                this.client.close();
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    bulkWrite = (collectionName, operations) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }

            this.client.db().collection(collectionName).bulkWrite(operations).then(result => {
                resolve(result);
            }).catch(async err => {
                await this.client.close();
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
                await this.client.connect();
            }

            try{
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
                await this.client.close();
                reject(err);
            }
        });
    }

    distinctQuery = (collectionName, keyFieldName, queryFields) => { 
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }


            this.client.db().collection(collectionName).distinct(keyFieldName, queryFields).then(async results => {
                resolve(results); 
            }).catch(err => {
                reject(err);
            });  
        });
    }

    updateOne = (collectionName, filter, updateObject) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }

            this.client.db().collection(collectionName).updateOne(filter, {$set : updateObject}).then(result => {
                resolve(result);
            }).catch(async err => {
                await this.client.close();
                reject(err);
            });
        });
    }

    deleteOne = (collectionName, filter) => {
        return new Promise(async (resolve, reject) => {
            if(!this.client.isConnected()){
                await this.client.connect();
            }

            this.client.db().collection(collectionName).deleteOne(filter).then(result => {
                resolve(result);
            }).catch(async err => {
                await this.client.close();
                reject(err);
            });
        });
    }
}