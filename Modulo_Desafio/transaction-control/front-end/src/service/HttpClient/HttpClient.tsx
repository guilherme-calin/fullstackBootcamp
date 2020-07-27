import Finance from '../../model/Finance/Finance'

export class HttpClient{
    private static host :string = "http://localhost:3001";
 
    public static getYearList = () : Promise<any> => {
        return new Promise((resolve, reject) => {
            fetch(`${HttpClient.host}/transaction/yearlist`).then(res => {
                resolve(res);
            }).catch(err => {   
                reject(err); 
            });
        })
    }

    public static getTransactionList = (yearMonth :string) : Promise<any> => {
        return new Promise((resolve, reject) => {
            fetch(`${HttpClient.host}/transaction/get?yearMonth=${yearMonth}`).then(res => {
                resolve(res);
            }).catch(err => {   
                reject(err); 
            });
        })
    }

    public static createTransaction = (finance :Finance) : Promise<any> => {
        return new Promise((resolve, reject) => {
            let data = {
                category: finance.getCategory(),
                description: finance.getDescription(),
                value: finance.getValue(),
                yearMonthDay: finance.getYearMonthDay(),
                yearMonth: finance.getYearMonth(),
                year: finance.getYear(),
                month: finance.getMonth(),
                day: finance.getDay(),
                type: finance.getType()
            }

            console.log(data);

            fetch(`${HttpClient.host}/transaction/create`, {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json",
                    "Content-Length" : JSON.stringify(data).length.toString()
                },
                body: JSON.stringify(data)
            }).then(res => {
                resolve(res);
            }).catch(err => {   
                console.log(err);
                reject(err); 
            });
        })
    }

    public static updateTransaction = (finance :Finance) : Promise<any> => {
        return new Promise((resolve, reject) => {
            console.log("Chegou no updateTransaction!");

            let data = {
                id: finance.getId(),
                category: finance.getCategory(),
                description: finance.getDescription(),
                value: finance.getValue(),
                yearMonthDay: finance.getYearMonthDay()
            }

            console.log(JSON.stringify(data));

            fetch(`${HttpClient.host}/transaction/update`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Content-Length" : JSON.stringify(data).length.toString()
                },
                body: JSON.stringify(data)
            }).then(res => {
                resolve(res);
            }).catch(err => {   
                console.log(err);
                reject(err); 
            });
        })
    }

    public static deleteTransaction = (finance :Finance) : Promise<any> => {
        return new Promise((resolve, reject) => {
            fetch(`${HttpClient.host}/transaction/delete?id=${finance.getId()}`, {
                method: "DELETE"
            }).then(res => {
                resolve(res);
            }).catch(err => {   
                console.log(err);
                reject(err); 
            });
        })
    }
}