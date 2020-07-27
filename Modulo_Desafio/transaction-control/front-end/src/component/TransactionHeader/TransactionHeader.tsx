import React, {Component} from 'react'
import "./TransactionHeader.css"
import Common from '../../service/Common/Common'

interface properties{
    text :string,
    transactionAmount :number,
    debtValue :number,
    creditValue :number,
    totalBalance :number
}
interface states{

}

export default class TransactionHeader extends Component<properties, states>{
    constructor(props : properties, state : states){
        super(props, state);
    }

    render = () :JSX.Element => {
        let formattedTransactionAmount :string;
        let formattedCreditValue :string;
        let formattedDebtValue :string;
        let formattedTotalBalance :string;
        let totalBalanceType :string = "";

        formattedTransactionAmount = this.props.transactionAmount.toString();
        formattedCreditValue = Common.formatNumber(this.props.creditValue, 2);
        formattedDebtValue = Common.formatNumber(this.props.debtValue, 2);
        formattedTotalBalance = Common.formatNumber(Math.abs(this.props.totalBalance), 2);

        if(this.props.totalBalance < 0){
            totalBalanceType = "-"
        }else if(this.props.totalBalance > 0){
            totalBalanceType = "+"
        }

        return(
            <div className="TransactionHeader">
                <div className="header">
                    <span>{this.props.text}</span>
                </div>
                <div className="value-summary">
                    <span>Transações: <span>{formattedTransactionAmount}</span></span>
                    <span>Receita: <span>R$ {formattedCreditValue}</span></span>
                    <span>Despesa: <span>R$ {formattedDebtValue}</span></span>
                    <span>Total: <span>{totalBalanceType} R$ {formattedTotalBalance}</span></span>
                </div>
            </div>
        )
    }
}