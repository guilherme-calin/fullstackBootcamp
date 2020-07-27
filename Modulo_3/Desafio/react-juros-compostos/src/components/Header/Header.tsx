import './Header.css'
import React, {Component} from 'react'

type props = {title :string}
export default class Header extends Component<props>{
    render(){
        return (
            <div className="Header">
                <h1>{this.props.title}</h1>
            </div>
        )
    }
}
