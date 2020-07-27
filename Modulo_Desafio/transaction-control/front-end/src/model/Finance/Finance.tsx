import Common from '../../service/Common/Common'

export default class Finance{
    private id :string;
    private yearMonthDay :string;
    private yearMonth :string;
    private category :string;
    private description :string;
    private value :number;
    private formattedValue :string;
    private type :string;
    private year :number;
    private month :number;
    private day :number;
    private dayOfWeekName :string;
    private dayNameList :Array<string>;

    constructor(object :{id? :string, yearMonthDay :string, category :string, description :string, value :number, type:string}){
        this.id = object.id || "";
        this.yearMonthDay = object.yearMonthDay;
        this.category = object.category;
        this.description = object.description;
        this.value = object.value;
        this.type = object.type;

        this.formattedValue = Common.formatNumber(this.value, 2);

        const splitYearMonthDay = this.yearMonthDay.split("-");

        this.yearMonth = `${splitYearMonthDay[0]}-${splitYearMonthDay[1]}`;

        this.year = parseInt(splitYearMonthDay[0]);
        this.month = parseInt(splitYearMonthDay[1]) - 1;
        this.day = parseInt(splitYearMonthDay[2]);

        this.dayNameList = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

        this.dayOfWeekName = this.dayNameList[(new Date(this.year, this.month - 1, this.day)).getDay()];
    }

    public getId = () :string => {
        return this.id
    }

    public getYearMonthDay = () :string => {
        return this.yearMonthDay
    }

    public getYearMonth = () :string => {
        return this.yearMonth
    }

    public getYear = () :number => {
        return this.year
    }

    public getMonth = () :number => {
        return this.month
    }

    public getDay = () :number => {
        return this.day
    }

    public getDayAsString = () :string => {
        return this.yearMonthDay.split("-")[2]
    }

    public getDayName = () :string =>{
        return this.dayOfWeekName;
    }

    public getCategory = () :string => {
        return this.category;
    } 

    public getDescription = () :string => {
        return this.description;
    }
    
    public getValue = () :number => {
        return this.value;
    }

    public getFormattedValue = () :string => {
        return this.formattedValue;
    }

    public getType = () :string => {
        return this.type;
    }

    public update = (object? :{id? :string, yearMonthDay? :string, category? :string, description? :string, value? :number, type? :string}) :boolean => {
        let update :boolean = false;

        if(object){
            if(object.id){
                this.id = object.id;

                update = true;
            }

            if(object.yearMonthDay && object.yearMonthDay !== this.yearMonthDay){
                const splitYearMonthDay = object.yearMonthDay.split("-");

                this.yearMonth = `${splitYearMonthDay[0]}-${splitYearMonthDay[1]}`;
        
                this.year = parseInt(splitYearMonthDay[0]);
                this.month = parseInt(splitYearMonthDay[1]);
                this.day = parseInt(splitYearMonthDay[2]);

                this.dayOfWeekName = this.dayNameList[(new Date(this.year, this.month - 1, this.day)).getDay()];

                update = true;
            }

            if(object.category){
                this.category = object.category;

                update = true;
            }

            if(object.description){
                this.description = object.description;

                update = true;
            }

            if(object.value){
                this.value = object.value;
                this.formattedValue = Common.formatNumber(this.value, 2);

                update = true;
            }

            if(object.type){
                this.type = object.type;

                update = true;
            }
        }

        return update;
    }
}