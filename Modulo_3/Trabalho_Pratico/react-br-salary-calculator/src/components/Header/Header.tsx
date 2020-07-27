import './Header.css'
import React, {Component} from 'react'

type props = {title? : string}
export class Header extends Component<props>{
    render(){
        return(
            <div className="Header">
                <h1>{this.props.title ? this.props.title : "Cabeçalho"}</h1>
            </div>
        )
    }
}
