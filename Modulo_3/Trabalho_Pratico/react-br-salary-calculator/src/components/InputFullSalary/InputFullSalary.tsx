import './InputFullSalary.css'
import React, {Component} from 'react'

type props = {title? : string, parentCallback : (fullSalary : string) => void}
export class InputFullSalary extends Component<props>{

    readonly inputHandler = (event : any) => {
        this.props.parentCallback(event.target.value);
    }

    render(){
        return(
            <div className="InputFullSalary">
                <fieldset>
                    <legend>Salário Bruto (R$)</legend>
                    <input type="number" step="0.1" onChange={this.inputHandler}></input>
                </fieldset>
            </div>
        )
    }
}