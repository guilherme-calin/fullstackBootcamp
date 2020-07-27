import React, {Component} from 'react'
import "./TransactionModal.css"
import Common from '../../service/Common/Common'
import Finance from '../../model/Finance/Finance'

interface properties{
    finance? :Finance,
    show :boolean,
    confirmCallback : (finance :Finance) => void,
    cancelCallback: () => void
}
interface states{
    id :string,
    headerOptionText :string,
    type :string,
    category :string,
    description :string,
    value :number,
    yearMonthDay :string,
    display :boolean
}

export default class TransactionHeader extends Component<properties, states>{
    constructor(props : properties, state : states){
        super(props, state);

        let id :string;
        let headerOptionText :string;
        let type :string;
        let category :string;
        let description :string;
        let value :number;
        let yearMonthDay :string;
        let display :boolean;

        id = !this.props.finance ? "" : this.props.finance.getId();
        type = !this.props.finance ? "" : this.props.finance.getType();
        headerOptionText = !this.props.finance ? "INCLUIR" : "EDITAR";
        category = !this.props.finance ? "" : this.props.finance.getCategory();
        description = !this.props.finance ? "" : this.props.finance.getDescription();
        value = !this.props.finance ? 0 : this.props.finance.getValue();
        yearMonthDay = !this.props.finance ? "" : this.props.finance.getYearMonthDay();

        display = this.props.show;

        this.state = {
            id,
            headerOptionText,
            type,
            category,
            description,
            value,
            yearMonthDay,
            display
        }
    }

    componentWillUnmount = () => {
        this.setState({
            display: false
        })

        return
    }

    render = () :JSX.Element => {
        let displayClass :string;

        if(this.state.display){
            displayClass = "show"
        }else{
            displayClass = "hide";
        }

        return(
            <div className={`TransactionModal ${displayClass}`}> 
                <div className="modal-content">
                    <div className="header">
                        <span>{this.state.headerOptionText} TRANSAÇÃO</span>
                    </div>

                    <div className="body">
                        <div className="radio-container">
                            <div className="row">
                                <input type="radio" name="type" id="credit" value="+" checked={this.state.type === "+" ? true : false} onChange={(e) => this.onChangeHandlerRadio(e.target.value)}></input>
                                <label htmlFor="credit">Receita</label>
                            </div>

                            <div className="row"> 
                                <input type="radio" name="type" id="debt" value="-" checked={this.state.type === "-" ? true : false} onChange={(e) => this.onChangeHandlerRadio(e.target.value)}></input>
                                <label htmlFor="debt">Despesa</label>
                            </div>
                        </div>

                        <div className="input-container">
                            <label htmlFor="category">Categoria:</label>
                            <input defaultValue={this.state.category} onChange={(e) => this.onChangeHandlerCategory(e.target.value)} type="text" id="category"></input>
                        </div>

                        <div className="input-container">
                            <label htmlFor="description">Descrição:</label>
                            <input defaultValue={this.state.description} onChange={(e) => this.onChangeHandlerDescription(e.target.value)} type="text" id="description"></input>
                        </div>

                        <div className="row">
                            <div className="input-container">
                                <label htmlFor="value">Valor:</label>
                                <input defaultValue={this.state.value} onChange={(e) => this.onChangeHandlerValue(e.target.value)} type="number" id="value"></input>
                            </div>

                            <div className="input-container">
                                <label htmlFor="yearMonthDay">Data:</label>
                                <input defaultValue={this.state.yearMonthDay} onChange={(e) => this.onChangeHandlerDate(e.target.value)} onBlur={(e) => this.onChangeHandlerDate(e.target.value)} type="date" id="yearMonthDay"></input>
                            </div>
                        </div>

                    </div>

                    <div className="options">
                        <button className="option-confirm" onClick={this.confirmAction}>Confirmar</button>
                        <button className="option-cancel" onClick={this.cancelAction}>Cancelar</button>
                    </div>
                </div>
            </div>
        )
    }

    onChangeHandlerRadio = (newValue :string) :void => {
        console.log(newValue);
        
        if(newValue){
            this.setState({
                type: newValue
            });
        }
        
        return
    }

    onChangeHandlerCategory = (newValue :string) :void => {
        console.log(newValue);

        if(newValue){
            this.setState({
                category : newValue
            });
        }

        return
    }

    onChangeHandlerDescription = (newValue :string) :void => {
        if(newValue){
            this.setState({
                description : newValue
            });
        }

        return
    }

    onChangeHandlerValue = (newValue :string) :void => {
        let value :number = 0;

        if(newValue && newValue !== ""){
            value = parseInt(newValue);
        }

        this.setState({
            value
        });

        return
    }

    onChangeHandlerDate = (newValue :string) :void => {
        if(newValue){
            this.setState({
                yearMonthDay : newValue
            });
        }

        return
    }

    confirmAction = () :void => {
        const {id, type, category, description, value, yearMonthDay} = this.state;

        if(type !== "" && category !== "" && description !== "" && value !== 0 && yearMonthDay !== ""){
            const finance = new Finance({id, yearMonthDay, category, description, type, value});

            this.props.confirmCallback(finance);

            this.setState({
                display :false
            })
        }
    }

    cancelAction = () :void =>  {
            this.setState({
                display :false
            });

            this.props.cancelCallback();

            return
    }
}