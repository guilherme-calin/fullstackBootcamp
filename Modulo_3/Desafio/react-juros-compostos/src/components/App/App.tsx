import React, {Component} from 'react';
import './App.css';
import Header from '../Header/Header'
import InputReadWrite from '../InputReadWrite/InputReadWrite'
import MonthlyInterest from '../MonthlyInterest/MonthlyInterest'

type monthlyCalculation = {
  month :number,
  accumulatedDifference :number,
  currentAmount :number,
  percentageDifference :number
}

export default class App extends Component{
  initialAmount :number = 0;
  interestRate :number = 0;
  timeConsidered :number = 0;
  compoundCalculations : Array<monthlyCalculation> = [];
  compoundElements :Array<any> = [];

  state :any = {
    compoundElements : []
  }

  getInitialAmount = (value :number) :void => {
    this.initialAmount = value;

    if(this.readyToCalculate()){
      this.calculateCompoundInterest();
    }else{
      this.compoundElements = []; 
      this.setState({compoundElements : this.compoundElements});
    }
  }

  getInterestRate = (value :number) :void => {
    this.interestRate = value;

    if(this.readyToCalculate()){
      this.calculateCompoundInterest();
    }else{
      this.compoundElements = []; 
      this.setState({compoundElements : this.compoundElements});
    }
  }

  getTimeConsidered = (value :number) :void => {
    this.timeConsidered = value;

    if(this.readyToCalculate()){
      this.calculateCompoundInterest();
    }else{
      this.compoundElements = []; 
      this.setState({compoundElements : this.compoundElements});
    }
  }

  readyToCalculate = () :boolean => {
    if(this.initialAmount && this.interestRate && this.timeConsidered){
      return true;
    }else{
      return false;
    }
  }

  calculateCompoundInterest = () :void => {
    let currentDifference :number = 0;
    let currentAmount :number = this.initialAmount;
    let percentageDifference :number = 0;

    this.compoundElements = []; 
    this.setState({compoundElements : this.compoundElements});

    for(let i = 1; i <= this.timeConsidered; i++){
      currentDifference += Math.abs(currentAmount) * this.interestRate / 100;
      currentAmount = this.initialAmount + currentDifference;
      percentageDifference = currentDifference / this.initialAmount * 100;

      this.compoundElements.push(
        <MonthlyInterest key={i+currentDifference} periodIndex={i} accumulatedDifference={currentDifference} currentAmount={currentAmount} percentageDifference={percentageDifference}></MonthlyInterest>
        );
    }
    
    this.setState({compoundElements : this.compoundElements});
  }

  render(){
    return (
      <div className="App">
        <Header title="Calculadora de Juros Compostos"></Header>
        
        <div className="input-row">
          <InputReadWrite title="Montante Inicial (R$)" getValueOnChange={this.getInitialAmount}></InputReadWrite>
          <InputReadWrite title="Taxa de juros (%)" getValueOnChange={this.getInterestRate}></InputReadWrite>
          <InputReadWrite title="Período (Meses)" step="1" getValueOnChange={this.getTimeConsidered}></InputReadWrite>
        </div> 

        <div className="calculation-container">
          {this.compoundElements}
        </div>
      </div> 
    );
  }

}

