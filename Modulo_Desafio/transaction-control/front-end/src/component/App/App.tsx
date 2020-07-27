import React, {Component} from 'react';
import './App.css';
import YearMonth from '../YearMonth/YearMonth'
import {HttpClient as http} from '../../service/HttpClient/HttpClient'

import TransactionHeader from '../TransactionHeader/TransactionHeader'
import Transaction from '../Transaction/Transaction'
import Finance from '../../model/Finance/Finance'
import Modal from '../../model/Modal/Modal'
import TransactionModal from '../TransactionModal/TransactionModal'

interface properties {}

interface states {
  yearList :Array<string>,
  validYearMonth :boolean,
  currentYear :string,
  currentMonth :string,
  currentMonthName :string,
  financeList :Array<Finance>,
  transactionList :Array<JSX.Element>,
  monthTransactionAmount :number,
  monthDebtValue :number,
  monthCreditValue :number,
  monthTotalBalance :number
}

export default class App extends Component<properties,states>{
  constructor(props : properties, state : states){
    super(props, state);

    this.state = {
      yearList : [(new Date()).getFullYear().toString()],
      validYearMonth : false,
      currentYear : "",
      currentMonth : "",
      currentMonthName : "",
      financeList : [],
      transactionList : [],
      monthTransactionAmount : 0,
      monthDebtValue : 0,
      monthCreditValue : 0,
      monthTotalBalance : 0
    }
  }

  componentDidMount = async () :Promise<void> => {    
    try{
      const result = await http.getYearList(); 
      
      if(Math.trunc(result.status / 100) === 2 ){  
        const jsonBody = await result.json();
       
        this.setState({
          yearList : jsonBody.yearList
        });

        return
      }else{
        throw new Error("Um ou mais erros ocorreram na requisição");
      }
    }catch (err){
      console.log(err); 
      return
    }
  }

  render = () :JSX.Element => {
    return (
      <div className="App">
        <h1>Controle de Transações Financeiras</h1>
        <YearMonth yearList={this.state.yearList} parentCallback={this.getYearMonthFromChild}></YearMonth>
        {this.state.validYearMonth ? 
        <div>
          <h2 className=""></h2>
          <TransactionHeader text={`${this.state.currentMonthName} de ${this.state.currentYear}`} transactionAmount={this.state.monthTransactionAmount} debtValue={this.state.monthDebtValue} creditValue={this.state.monthCreditValue} totalBalance={this.state.monthTotalBalance}></TransactionHeader>
          <div className="row">
            <button className="include-option" onClick={this.createAction}>INCLUIR</button>
            <input type="search" className="search-input"></input>
            <button className="search-option">Buscar</button>
          </div>
          {this.state.transactionList}
        </div>
        :
        null}
      </div>
    );
  }

  public getYearMonthFromChild = async (returnObject :{valid :boolean, year :string, month :string, monthName :string}) :Promise<void> => {
    const {valid : validYearMonth, year : currentYear, month : currentMonth, monthName :currentMonthName} = returnObject;

    this.setState({
      validYearMonth, 
      currentYear,
      currentMonth,
      currentMonthName
    });

    if(validYearMonth){
      let financeList :Array<Finance> = [];
      let transactionList :Array<JSX.Element> = [];

      try{
        const result = await http.getTransactionList(`${currentYear}-${currentMonth}`); 
        
        if(Math.trunc(result.status / 100) === 2 ){  
          const jsonBody = await result.json();

          console.log(jsonBody);

          let sortedFinanceList = jsonBody.transactions.sort((itemA :any, itemB :any) => parseInt(itemA.yearMonthDay.split("-")[2]) - parseInt(itemB.yearMonthDay.split("-")[2]));
          
          for(let i=0; i < sortedFinanceList.length; i++){
            financeList.push(new Finance({
              id : sortedFinanceList[i]._id,
              yearMonthDay : sortedFinanceList[i].yearMonthDay,
              category : sortedFinanceList[i].category,
              description : sortedFinanceList[i].description,
              value : sortedFinanceList[i].value,
              type : sortedFinanceList[i].type
            }));

            transactionList.push(
              <Transaction key={financeList[i].getId()} finance={financeList[i]} editHandler={this.editAction} deleteHandler={this.deleteTransaction}></Transaction>
            );
          }
  
          this.setState({
            financeList,
            transactionList,
            monthTransactionAmount : jsonBody.transactionsFound,
            monthDebtValue : jsonBody.debtValue,
            monthCreditValue : jsonBody.creditValue,
            monthTotalBalance : jsonBody.totalBalance
          });

          return
        }else{
          throw new Error("Um ou mais erros ocorreram na requisição");
        }
      }catch (err){
        console.log(err); 
        return
      }
    }
  }

  public createAction = () :void => {
    console.log("Clicou no criar!");
    new Modal(this.createTransaction).render();

    return
  }

  public editAction = (financeItem :Finance) => {
    console.log("Clicou no editar!");
    console.log(financeItem);

    new Modal(this.editTransaction, financeItem).render();

    return
  }

  public createTransaction = async (financeItem :Finance) :Promise<void> => {
    try{
      const result = await http.createTransaction(financeItem); 
      
      if(Math.trunc(result.status / 100) === 2 ){
        const jsonBody = await result.json();

        console.log(jsonBody);

        const id = jsonBody.transaction._id;

        const financeList = [...this.state.financeList];

        financeItem.update({id});

        financeList.push(financeItem);

        const sortedArray :Array<Finance> = financeList.sort((itemA, itemB) => itemA.getDay() - itemB.getDay());

        let transactionList :Array<JSX.Element> = [];

        for(let i = 0; i < financeList.length; i++){
          transactionList.push(<Transaction key={financeList[i].getId()} finance={financeList[i]} editHandler={this.editAction} deleteHandler={this.deleteTransaction}></Transaction>);
        }
        

        this.setState({
          financeList : sortedArray,
          transactionList
        });

        this.updateMonthInformation(financeList);

        return
      }else{
        const jsonBody = await result.json();
        console.log(jsonBody);
        throw new Error("Um ou mais erros ocorreram na requisição");
      }
    }catch (err){
      console.log(err); 
      return
    }
  }

  public editTransaction = async (financeItem :Finance) => {
    try{
      const result = await http.updateTransaction(financeItem); 
      
      if(Math.trunc(result.status / 100) === 2 ){
        console.log(financeItem.getId());

        let index = this.state.financeList.findIndex((finance :Finance) => {
          return finance.getId() === financeItem.getId()
        });

        console.log(`Índice é ${index}`);

        const financeList = [...this.state.financeList];

        financeList[index].update({
          id: financeItem.getId(),
          category: financeItem.getCategory(),
          description: financeItem.getDescription(),
          value: financeItem.getValue(),
          yearMonthDay: financeItem.getYearMonthDay()});

        console.log(financeList[index]);

        let transactionList :Array<JSX.Element> = [...this.state.transactionList];

        transactionList[index] = <Transaction key={financeList[index].getId()} finance={financeList[index]} editHandler={this.editAction} deleteHandler={this.deleteTransaction}></Transaction>;

        this.setState({
          financeList,
          transactionList
        });

        this.updateMonthInformation(financeList);

        return
      }else{
        throw new Error("Um ou mais erros ocorreram na requisição");
      }
    }catch (err){
      console.log(err); 
      return
    }
  }
  
  public deleteTransaction = async (financeItem :Finance) => {
    try{
      const result = await http.deleteTransaction(financeItem); 
      
      if(Math.trunc(result.status / 100) === 2 ){
        console.log(financeItem.getId());

        let index = this.state.financeList.findIndex((finance :Finance) => {
          return finance.getId() === financeItem.getId()
        });

        console.log(`Índice é ${index}`);

        let financeList :Array<Finance> = [...this.state.financeList];
        let transactionList :Array<JSX.Element> = [...this.state.transactionList];

        financeList.splice(index, 1);
        transactionList.splice(index, 1);

        this.setState({
          financeList,
          transactionList
        });

        this.updateMonthInformation(financeList);

        return
      }else{
        throw new Error("Um ou mais erros ocorreram na requisição");
      }
    }catch (err){
      console.log(err); 
      return
    }
  }
  
  private updateMonthInformation(financeList : Array<Finance>) :void{
    let monthTransactionAmount :number = financeList.length;
    let monthDebtValue :number = 0;
    let monthCreditValue :number = 0;
    let monthTotalBalance :number = 0;

    for(let i = 0; i < financeList.length; i++){
      if(financeList[i].getType() === "+"){
        monthCreditValue += financeList[i].getValue();
        monthTotalBalance += financeList[i].getValue();
      }else{
        monthDebtValue += financeList[i].getValue();
        monthTotalBalance -= financeList[i].getValue();
      }
    }

    this.setState({
      monthTransactionAmount,
      monthCreditValue,
      monthDebtValue,
      monthTotalBalance
    });

    return
  }
}

  



