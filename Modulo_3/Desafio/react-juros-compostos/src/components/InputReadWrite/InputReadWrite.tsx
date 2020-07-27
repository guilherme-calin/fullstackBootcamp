import './InputReadWrite.css'
import React, {Component} from 'react'

type props = {title :string, step? :string, getValueOnChange? :(value :number) => void};

export default class InputReadWrite extends Component<props>{
    getValue = (event :any) => {
        if(this.props.getValueOnChange) this.props.getValueOnChange(parseFloat(event.target.value));
    }

    render(){
        return(
            <div className="InputReadWrite">
                <label htmlFor="js-input-read-write">{this.props.title}</label>
                {
                    this.props.getValueOnChange ? 
                    <input type="number" id="js-input-read-write" step={this.props.step ? this.props.step : "0.1"}  onChange={this.getValue}></input>
                    :
                    <input type="number" id="js-input-read-write" step="0.1"></input>
                }
            </div>
        )
    }
}