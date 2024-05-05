import React, {useContext, useState} from "react"
import {useEffect} from "react";
import {getBudgetsByUserID, getTransaction} from "../auth/actions/userActions";

const BudgetsContext = React.createContext();
export const useBudgets = () => useContext(BudgetsContext);


export const BudgetsProvider = ({children}) => {
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const userID = localStorage.getItem("token"); // Assicurati di sostituire con l'ID dell'utente reale
                const data = await getBudgetsByUserID(userID);
                // Estrai gli id dei budget dalla risposta e crea un nuovo array di oggetti con solo gli id
                //const budgetIds = data.data.map(budget => budget._id);

                // Aggiorna lo stato budgets con gli id dei budget
                //setBudgets(budgetIds);
                setBudgets(data.data);

            } catch (error) {
                console.error("Error fetching budgets and expenses:", error);
            }
        };

        fetchBudgets();
    }, []);


    const getBudgetExpenses =  (budgetID) => {
        try {

            console.log("BID", budgetID);
            const data =  getTransaction(budgetID);
            console.log("DATA", data);
            // Estrai gli id dei budget dalla risposta e crea un nuovo array di oggetti con solo gli id
            //const budgetIds = data.data.map(budget => budget._id);

            // Aggiorna lo stato budgets con gli id dei budget
            //setBudgets(budgetIds);
            setExpenses(data.data);

        } catch (error) {
            console.error("Error fetching budgets and expenses:", error);
        }
    };


    return (
        <BudgetsContext.Provider
            value={{
                budgets,
                expenses,
                getBudgetExpenses,
            }}
        >
            {children}
        </BudgetsContext.Provider>
    )
}
