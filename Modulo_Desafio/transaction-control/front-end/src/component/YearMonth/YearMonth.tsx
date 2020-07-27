import React, {Component} from 'react'
import "./YearMonth.css"

interface properties{
    yearList : Array<string>,
    parentCallback : (returnObject :{valid :boolean, year :string, month :string, monthName :string}) => void
}
interface states{
    defaultYear: {label :string, value :string},
    defaultMonth: {label :string, value :string},
    selectYearClass :string,
    selectMonthClass :string,
    currentYearValue :string,
    currentMonthValue :string,
    monthNames : Array<string>
}

export default class YearMonth extends Component<properties, states>{
    public monthName : Array<string> = [];

    constructor(props : properties, state : states){
        super(props, state);

        this.state = {
            defaultYear : {
                label : "Ano",
                value : "0000"
            },
            defaultMonth : {
                label : "Mês",
                value : "00"
            },
            monthNames : [
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro"
            ],
            selectYearClass : "greyed",
            selectMonthClass : "greyed",
            currentMonthValue : "00",
            currentYearValue : "0000"
        }
    }

    render(){
        let monthOptions :Array<JSX.Element> = [];
        let yearOptions :Array<JSX.Element> = [];

        monthOptions.push(<option key={0} value={this.state.defaultMonth.value}>{this.state.defaultMonth.label}</option>);

        for(let i=0; i < this.state.monthNames.length; i++){
            monthOptions.push(<option key={i+1} value={(i+1).toString().padStart(2, "0")}>{this.state.monthNames[i]}</option>);
        }

        yearOptions.push(<option key={0} value={this.state.defaultYear.value}>{this.state.defaultYear.label}</option>);
       
        for(let i=0; i < this.props.yearList.length; i++){
            yearOptions.push(<option key={i+1} value={(this.props.yearList[i]).toString()}>{this.props.yearList[i].toString()}</option>);
        }

        return (
            <div className="YearMonth">
                <select className={this.state.selectMonthClass} defaultValue={this.state.defaultMonth.value} onChange={(event) => {this.change(event, "month")}}>
                    {monthOptions}
                </select>

                <select className={this.state.selectYearClass} defaultValue={this.state.defaultYear.value} onChange={(event) => {this.change(event, "year")}}>
                    {yearOptions}
                </select>
            </div>
        )
    }

    change = (event :any, yearOrMonth :string) :void => {
        const newValue :string = event.target.value;
        let year :string = "";
        let month :string = "";
        let monthName :string = "";
        let valid :boolean = true; //Indica se o valor retornado é válido 

        if(yearOrMonth === "year") {
            if(newValue === this.state.defaultYear.value) {
                this.setState({
                    selectYearClass : "greyed"
                });
            }else{
                this.setState({
                    selectYearClass : ""
                });
            }

            this.setState({
                currentYearValue : newValue
            });

            if(newValue === this.state.defaultYear.value || this.state.currentMonthValue === this.state.defaultMonth.value){
                valid = false;
            }

            year = newValue;
            month = this.state.currentMonthValue;           
        }else if(yearOrMonth === "month"){
            if(newValue === this.state.defaultMonth.value) {
                valid = false;

                this.setState({
                    selectMonthClass : "greyed"
                });
            }else{
                this.setState({
                    selectMonthClass : ""
                });
            }

            this.setState({
                currentMonthValue : newValue
            });

            if(newValue === this.state.defaultMonth.value || this.state.currentYearValue === this.state.defaultYear.value){
                valid = false;
            }

            year = this.state.currentYearValue;   
            month = newValue;
        }

        if(month !== this.state.defaultMonth.value){
            monthName = this.state.monthNames[parseInt(month) - 1];
        }

        this.props.parentCallback({valid, year, month, monthName});

        return
    }
}