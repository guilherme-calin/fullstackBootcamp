import './InputReadOnly.css'
import React, {Component} from 'react'

type props = {title : string, textContent : number, textColor? : string}
export class InputReadOnly extends Component<props>{
    render(){
        return(
            <div className="InputReadOnly">
                <fieldset>
                    <legend style={{color: this.props.textColor ? this.props.textColor : "#000000"}}>{this.props.title}</legend>
                    <input type="text" value={this.props.textContent} disabled></input>
                </fieldset>
            </div>
        )
    }
}