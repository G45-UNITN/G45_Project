//pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EmailSent from "./pages/EmailSent";
import ForgottenPassword from "./pages/ForgottenPassword";
import PasswordReset from "./pages/PasswordReset";

//styled components
import { StyledContainer } from "./components/Styles";


import {
  BrowserRouter as Router,
  Routes,
  Route,
    useLocation,
} from "react-router-dom";
import News from "./pages/News";
import Report from "./pages/Report";
import Transactions from "./pages/Transactions";
import BudgetPage from "./pages/BudgetPage";


// function App() {
//   return (
//     <Router>
//       <StyledContainer>
//         <Routes>
//           <Route path="/passwordreset/:userID/:resetString" element={<PasswordReset />} />
//           <Route path="/forgottenpassword" element={<ForgottenPassword />} />
//           <Route path="/emailsent/:userEmail?/:reset?" element={<EmailSent />} />
//           <Route path="/login/:userEmail?" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/news" element={<News />} />
//           <Route path="/report" element={<Report />} />
//           <Route path="/transactions" element={<Transactions />} />
//           <Route path="/budget" element={<Budget />} />
//           <Route path="/budgetpage" element={<BudgetPage />} />
//           <Route path="/" element={<Home />} />
//         </Routes>
//       </StyledContainer>
//     </Router>
//   );
// }
// function App() {
//   return (
//       <Router>
//         <Routes>
//           <Route path="/passwordreset/:userID/:resetString" element={<StyledContainer><PasswordReset /></StyledContainer>} />
//           <Route path="/forgottenpassword" element={<StyledContainer><ForgottenPassword /></StyledContainer>} />
//           <Route path="/emailsent/:userEmail?/:reset?" element={<StyledContainer><EmailSent /></StyledContainer>} />
//           <Route path="/login/:userEmail?" element={<StyledContainer><Login /></StyledContainer>} />
//           <Route path="/signup" element={<StyledContainer><Signup /></StyledContainer>} />
//           <Route path="/dashboard" element={<StyledContainer><Dashboard /></StyledContainer>} />
//           <Route path="/news" element={<StyledContainer><News /></StyledContainer>} />
//           <Route path="/report" element={<StyledContainer><Report /></StyledContainer>} />
//           <Route path="/transactions" element={<StyledContainer><Transactions /></StyledContainer>} />
//           <Route path="/budget" element={<StyledContainer><Budget /></StyledContainer>} />
//           {/* Applica una classe unica solo per la route budgetpage */}
//           <Route path="/budgetpage" element={<StyledContainer className="budget-page"><BudgetPage /></StyledContainer>} />
//           <Route path="/" element={<StyledContainer><Home /></StyledContainer>} />
//         </Routes>
//       </Router>
//   );
// }
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/passwordreset/:userID/:resetString" element={<StyledContainer><PasswordReset /></StyledContainer>} />
          <Route path="/forgottenpassword" element={<StyledContainer><ForgottenPassword /></StyledContainer>} />
          <Route path="/emailsent/:userEmail?/:reset?" element={<StyledContainer><EmailSent /></StyledContainer>} />
          <Route path="/login/:userEmail?" element={<StyledContainer><Login /></StyledContainer>} />
          <Route path="/signup" element={<StyledContainer><Signup /></StyledContainer>} />
          {/*<Route path="/dashboard" element={<StyledContainer><Dashboard /></StyledContainer>} />*/}
          <Route path="/news" element={<StyledContainer><News /></StyledContainer>} />
          <Route path="/report" element={<StyledContainer><Report /></StyledContainer>} />
          <Route path="/transactions" element={<StyledContainer><Transactions /></StyledContainer>} />
          {/* Utilizza un componente Wrapper con una condizione per BudgetPage */}
          <Route path="/budgetpage" element={<BudgetPageWrapper />} />
          <Route path="/" element={<StyledContainer><Home /></StyledContainer>} />
        </Routes>
      </Router>
  );
}

// Componente Wrapper per BudgetPage con allineamento diverso
function BudgetPageWrapper() {
  const location = useLocation();
  const alignItems = location.pathname === "/budgetpage" ? 'flex-start' : 'center';

  return (
      <StyledContainer className="budget-page" alignItems={alignItems}>
        <BudgetPage />
      </StyledContainer>
  );
}




export default App;
