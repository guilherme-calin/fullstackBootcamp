import { promises as fsP, constants } from 'fs'

export default class File{
    constructor(){}

    static getJSON(filePath, fileName){
        return new Promise((resolve, reject) => {
            fsP.readFile(`${filePath}/${fileName}`).then(data => {
                try {
                    const jsonData = JSON.parse(data);

                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            }).catch(err => {
                reject(err);
            })
        });
    }
}