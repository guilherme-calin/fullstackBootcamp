import React, {Component} from 'react'
import './Calculator.css'
import {InputFullSalary} from '../InputFullSalary/InputFullSalary'
import {InputReadOnly} from '../InputReadOnly/InputReadOnly'
import {props as salaryBarProps} from '../SalaryBar/SalaryBar'

type props = {
    parentCallback :(object :salaryBarProps) => void
}
export class Calculator extends Component<props>{
    inssColor :string = "#CC1111";
    irrfColor :string = "#BBAA33";
    liquidSalaryColor :string = "#11CC22";

    state :any = {
        inssBase : "R$ 0",
        irrfBase: "R$ 0",
        inssDiscount : "R$ 0 (0%)",
        irrfDiscount: "R$ 0(0%)",
        liquidSalary : "R$ 0 (0%)"
    }

    render(){
        return(
            <div className="Calculator">
                <div className="row">
                    <InputFullSalary parentCallback={this.getFullSalary}></InputFullSalary>
                </div>
                <div className="row">
                    <InputReadOnly title="Base INSS" textContent={this.state.inssBase}></InputReadOnly>
                    <InputReadOnly title="Base IRRF" textContent={this.state.irrfBase}></InputReadOnly>
                </div>
                <div className="row">
                    <InputReadOnly title="Desconto INSS" textContent={this.state.inssDiscount} textColor={this.inssColor}></InputReadOnly>
                    <InputReadOnly title="Desconto IRRF" textContent={this.state.irrfDiscount} textColor={this.irrfColor}></InputReadOnly>
                </div>
                <div className="row">
                    <InputReadOnly title="Salário Líquido" textContent={this.state.liquidSalary} textColor={this.liquidSalaryColor}></InputReadOnly>
                </div>
            </div>
        )
    }

    readonly getFullSalary = (fullSalary :string) :void => {
        if(fullSalary){
            const salaryProperties :any = this.calculateLiquidSalary(Number.parseFloat(fullSalary));
            const {inssBase, irrfBase, inssDiscount, irrfDiscount, liquidSalary} :any = salaryProperties;
            const barProperties = {
                inss : {width: `${salaryProperties.inssDiscountPercentage.toFixed(2)}%`, color: this.inssColor},
                irrf : {width: `${salaryProperties.irrfDiscountPercentage.toFixed(2)}%`, color: this.irrfColor},
                liquidSalary : {width: `${salaryProperties.liquidSalaryPercentage.toFixed(2)}%`, color: this.liquidSalaryColor}
            }

            this.setState({inssBase, irrfBase, inssDiscount, irrfDiscount, liquidSalary});

            this.props.parentCallback(barProperties);
        }
    }

    readonly calculateLiquidSalary = (fullSalaryValue :number) :any => {
        let inssBaseValue :number = fullSalaryValue;
        let inssDiscountValue :number = this.getINSSDiscount(fullSalaryValue);
        let inssDiscountPercentage :number = inssDiscountValue/fullSalaryValue * 100;
        let irrfBaseValue :number = inssBaseValue - inssDiscountValue;
        let irrfDiscountValue :number = this.getIRRFDiscount(irrfBaseValue);
        let irrfDiscountPercentage :number = irrfDiscountValue/fullSalaryValue * 100;
        let liquidSalaryValue :number = fullSalaryValue - inssDiscountValue - irrfDiscountValue;
        let liquidSalaryPercentage :number = liquidSalaryValue / fullSalaryValue * 100;

        
        let inssBase :string = `R$ ${inssBaseValue.toFixed(2)}`;
        let irrfBase :string = `R$ ${irrfBaseValue.toFixed(2)}`;
        let inssDiscount :string = `R$ ${inssDiscountValue.toFixed(2)} (${inssDiscountPercentage.toFixed(2)}%)`;
        let irrfDiscount :string = `R$ ${irrfDiscountValue.toFixed(2)} (${irrfDiscountPercentage.toFixed(2)}%)`;
        let liquidSalary :string = `R$ ${liquidSalaryValue.toFixed(2)} (${liquidSalaryPercentage.toFixed(2)}%)`;
        

        return {inssBase, irrfBase, inssDiscount, irrfDiscount, liquidSalary, inssDiscountPercentage, irrfDiscountPercentage, liquidSalaryPercentage}     
    }
    
    readonly getINSSDiscount = (fullSalary :number) :any => {
        let discountValue :number = 0;
        let remainingSalaryValue :number = fullSalary;

        const rangeTable : any[] = [
            {value : 1045.0, percentage: 7.5},
            {value : 2089.60, percentage: 9},
            {value : 3134.40, percentage: 12},
            {value : 6101.06, percentage: 14}
        ] ;
        let tableIndex = 0;

        console.log()
        while(remainingSalaryValue > 0 && tableIndex < rangeTable.length){
            let valueToCalculate :number = 0;

            if(tableIndex === 0){
                if(remainingSalaryValue <= rangeTable[tableIndex].value){
                    valueToCalculate = remainingSalaryValue;               
                } else {
                    valueToCalculate = rangeTable[tableIndex].value;
                }
            }else if(tableIndex > 0 && tableIndex < rangeTable.length){
                if(remainingSalaryValue <= rangeTable[tableIndex].value - rangeTable[tableIndex - 1].value){
                    valueToCalculate = remainingSalaryValue;               
                } else {
                    valueToCalculate = rangeTable[tableIndex].value - rangeTable[tableIndex - 1].value;
                }
            }

            discountValue += valueToCalculate * rangeTable[tableIndex].percentage / 100;
            remainingSalaryValue -= valueToCalculate;
            
            tableIndex++;
        }

        return parseFloat(discountValue.toFixed(2));
    }

    readonly getIRRFDiscount = (irrfBase :number) :any => {
        let discountValue :number = 0;
        let percentage :number = 0;
        let subtractionValue :number = 0;

        const rangeTable : any[] = [
            {value : 1903.98, percentage: 0, subtraction: 0},
            {value : 2826.65, percentage: 7.5, subtraction: 142.80},
            {value : 3751.05, percentage: 15, subtraction: 354.80},
            {value : 4664.68, percentage: 22.5, subtraction: 636.13},
            {percentage: 27.5, subtraction: 869.36},
        ] ;
        let tableIndex = 0;

        for(let i :number = 0; i < rangeTable.length; ++i){
            if(i !== rangeTable.length - 1){
                if(irrfBase <= rangeTable[i].value){
                    percentage = rangeTable[i].percentage;
                    subtractionValue = rangeTable[i].subtraction; 
                    break;
                }
            }else{
                percentage = rangeTable[i].percentage; 
                subtractionValue = rangeTable[i].subtraction; 
            }
        }
        
        discountValue = (irrfBase * percentage / 100) - subtractionValue;

        return parseFloat(discountValue.toFixed(2));
    }
}


