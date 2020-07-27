import React, {Component} from 'react'
import "./Transaction.css"
import deleteIcon from './assets/delete-icon.svg'
import editIcon from './assets/edit-icon.svg'
import Finance from '../../model/Finance/Finance'

interface properties{
    finance :Finance,
    editHandler :(clickedItem :Finance) => void,
    deleteHandler :(clickedItem :Finance) => void
}
interface states{

}

export default class Transaction extends Component<properties, states>{
    constructor(props :properties, state :states){
        super(props, state);
    }

    render = () :JSX.Element => {
        let valueClass :string = "";
        let transactionType :string = this.props.finance.getType();

        transactionType === "+" ? valueClass = "credit" : valueClass = "debt";
        
        return(
            <div className="Transaction">
                <div className="column day-container">
                    <div className="day-number">
                        <span>{this.props.finance.getDayAsString()}</span>
                    </div>
                    <div className="day-name">
                        <span>{this.props.finance.getDayName()}</span>
                    </div>
                </div>

                <div className="column info-container">
                    <div className="info-category">
                        <span>{this.props.finance.getCategory()}</span>
                    </div>
                    <div className="info-description">
                        <span>{this.props.finance.getDescription()}</span>
                    </div>
                </div>

                <div className="column value-container">
                    <div className="value-number">
                        <span className={valueClass}>{transactionType} R${this.props.finance.getFormattedValue()}</span>
                    </div>
                </div>

                <div className="column options-container">
                        <img className="options-edit" src={editIcon} onClick={() => this.props.editHandler(this.props.finance)} alt="Editar"></img>
                        <img className="options-delete" src={deleteIcon} onClick={() => this.props.deleteHandler(this.props.finance)} alt="Excluir"></img>                                  
                </div>
            </div>
        )
    }
}