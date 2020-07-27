import Finance from '../Finance/Finance'
import TransactionModal from '../../component/TransactionModal/TransactionModal';
import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom'

export default class Modal{
    private transactionModal :JSX.Element;
    private elementReference :any;
    private parentCallback :(finance :Finance) => void;
    private containerElement :any;

    constructor(parentCallback :(financeItem :Finance) => void, finance? :Finance){
        this.parentCallback = parentCallback;
        this.containerElement = document.createElement('div');

        console.log("Chupa que é de uva");
        
        if(finance){
            this.transactionModal = React.createElement(TransactionModal, {confirmCallback : this.confirmHandler, cancelCallback : this.cancelHandler, finance: finance, show : true});
        }else{
            this.transactionModal = React.createElement(TransactionModal, {confirmCallback : this.confirmHandler, cancelCallback : this.cancelHandler, show : true});
        }
    }

    public confirmHandler = (finance :Finance) :void => {
        this.parentCallback(finance);

        this.unmount();

        return
    }

    public cancelHandler = () :void => {
        this.unmount();

        return
    }

    public render = () :void => {
        document.body.appendChild(this.containerElement);

        this.elementReference = ReactDOM.render(this.transactionModal, this.containerElement);

        return
    }

    public unmount = () :void => {
        ReactDOM.unmountComponentAtNode(this.containerElement);

        document.body.removeChild(this.containerElement);

        return
    }
}