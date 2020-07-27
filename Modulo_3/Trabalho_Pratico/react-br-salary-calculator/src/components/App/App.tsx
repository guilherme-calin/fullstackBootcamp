import React, {Component} from 'react';
import './App.css';
import {Header} from '../Header/Header'
import {Calculator} from '../Calculator/Calculator'
import {SalaryBar, props as SalaryProps} from '../SalaryBar/SalaryBar'

export class App extends Component {
  state = {   
    inss: {width :"33.333%", color : "#cccccc"},
    irrf: {width :"33.333%", color : "#cccccc"},
    liquidSalary: {width :"33.333%", color : "#cccccc"},
  }

  readonly getCalculatorProps = (properties :SalaryProps) => {
    console.log(properties);
    this.setState(properties);
  }

  render(){
    return (
      <div className="App">
        <Header title="Calculadora de Salário Líquido"></Header>
        <Calculator parentCallback={this.getCalculatorProps}></Calculator>
        <SalaryBar inss={this.state.inss} irrf={this.state.irrf} liquidSalary={this.state.liquidSalary}></SalaryBar>
      </div>
    );
  }
}

