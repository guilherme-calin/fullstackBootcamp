export default class Common{
    constructor(){}

    public static formatNumber(value :number, decimalDigits? :number) :string{
        let valueAsString :string = value.toFixed(decimalDigits || 2);
        let splitValue = valueAsString.split(".");
        let valueAsStringArray : Array<string> = [];
        let formattedValueAsArray: Array<string> = [];
        let numberOfDigitsIterated :number = 0;
        let insertDot :boolean = false;

        for(let char of splitValue[0]){
            valueAsStringArray.push(char);
        }

        for(let i = valueAsStringArray.length - 1; i >= 0 ;i--){
            formattedValueAsArray.splice(0,0, valueAsStringArray[i]);

            numberOfDigitsIterated++;

            if(numberOfDigitsIterated === 3 && i !== 0){
                insertDot = true;
            }

            if(insertDot){
                formattedValueAsArray.splice(0, 0, ".");

                insertDot = false;
                numberOfDigitsIterated = 0;
            }
        }

        return `${formattedValueAsArray.join("")},${splitValue[1]}`
    }
}