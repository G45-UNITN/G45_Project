import React from "react";
import * as AiIcons from 'react-icons/ai';
import { BiSolidReport } from "react-icons/bi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaRegNewspaper } from "react-icons/fa6";



import Dashboard from "../pages/Dashboard";


export const sideBarData = [
    {
        title: "BudgetPage",
        path: "/budgetpage",
        icon: <AiIcons.AiFillHome />, // Utilizza l'icona correttamente
        cName: "nav-text",
    },
    {
        title: "Transactions",
        path: "/transactions",
        icon: <FaMoneyBillTransfer />, // Utilizza l'icona correttamente
        cName: "nav-text",
    },
    {
        title: "Report",
        path: "/report",
        icon: <BiSolidReport />, // Utilizza l'icona correttamente
        cName: "nav-text",
    },
    {
        title: "News",
        path: "/news",
        icon: <FaRegNewspaper />, // Utilizza l'icona correttamente
        cName: "nav-text",
    },
];
