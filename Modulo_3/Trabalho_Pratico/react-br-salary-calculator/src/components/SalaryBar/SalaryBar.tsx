import './SalaryBar.css'
import React, {Component} from 'react'

export type props = {
    inss: {width :string, color :string},
    irrf: {width :string, color :string}
    liquidSalary: {width :string, color :string}
}

export class SalaryBar extends Component<props>{
    render(){

        return(
            <div className="SalaryBar">
                <div style={{width: this.props.inss.width, backgroundColor: this.props.inss.color}}>'</div>
                <div style={{width: this.props.irrf.width, backgroundColor: this.props.irrf.color}}></div>
                <div style={{width: this.props.liquidSalary.width, backgroundColor: this.props.liquidSalary.color}}></div>
            </div>
        )
    }
}