import './MonthlyInterest.css'
import React, {Component} from 'react'

type props = {
    currentAmount :number;
    accumulatedDifference :number;
    percentageDifference: number;
    periodIndex: number;
}

type state = {
    classBaseComponent :Array<string>;
}
export default class MonthlyInterest extends Component<props>{
    classBaseComponent :Array<string> = [];
    classCurrAmount :string;
    classAccDiff :string;
    classPercDiff :string;

    currentAmountText :string;
    accumulatedDifferenceText :string;
    percentageDifferenceText :string;

    states :state = {
        classBaseComponent : []
    }

    constructor(props :props){
        super(props);

        this.classBaseComponent.push("MonthlyInterest");
        this.classCurrAmount = "";
        this.classAccDiff  = "";
        this.classPercDiff  = "";
    
        this.currentAmountText  = "";
        this.accumulatedDifferenceText  = "";
        this.percentageDifferenceText  = "";
    }

    componentWillUnmount(){
        this.classBaseComponent[1] = "invisible";
        this.setState(this.classBaseComponent);
    }

    componentDidMount(){
        this.classBaseComponent.push("invisible")
        this.setState(this.classBaseComponent);
        setTimeout(() => {
            this.classBaseComponent[1] = "visible";
            this.setState(this.classBaseComponent);
        } , 10)
    }

    render(){
        if(this.props.accumulatedDifference > 0){
            this.classCurrAmount = 'positiveAmount';
            this.classAccDiff = 'positiveDiff';
            this.classPercDiff = this.classAccDiff;

            this.currentAmountText = `R$ ${this.props.currentAmount.toFixed(2).replace('.',',')}`;
            this.accumulatedDifferenceText = `+R$ ${this.props.accumulatedDifference.toFixed(2).replace('.',',')}`;
            this.percentageDifferenceText = `+${this.props.percentageDifference.toFixed(2).replace('.',',')}%`;
        }else{
            this.classCurrAmount = 'negativeAmount';
            this.classAccDiff = 'negativeDiff';
            this.classPercDiff = this.classAccDiff;

            this.currentAmountText = `R$ ${this.props.currentAmount.toFixed(2).replace('.',',')}`;
            this.accumulatedDifferenceText = `-R$ ${Math.abs(this.props.accumulatedDifference).toFixed(2).replace('.',',')}`;
            this.percentageDifferenceText = `${this.props.percentageDifference.toFixed(2).replace('.',',')}%`;
        }
        return(
            <div className={this.classBaseComponent.length > 1 ? this.classBaseComponent.join(' ') : this.classBaseComponent[0]}>  
                <span className={this.classCurrAmount}>{this.currentAmountText}</span>
                <span className={this.classAccDiff}>{this.accumulatedDifferenceText}</span>
                <span className={this.classPercDiff}>{this.percentageDifferenceText}</span>               
                <span>{this.props.periodIndex}</span>
            </div>
        )
    }
}