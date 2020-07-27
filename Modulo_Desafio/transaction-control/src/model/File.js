import { promises as fsP} from 'fs'

export default class File{
    constructor(){}

    static getJSON(filePath){
        return new Promise((resolve, reject) => {
            fsP.readFile(filePath).then(data => {
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