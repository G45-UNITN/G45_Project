import {StyledTitle, StyledSubTitle} from "./../components/Styles";
import {GoAlertFill} from "react-icons/go";
import Navbar from "../components/Navbar";
import "../index.css";


const Transactions = () => {
    return (
        <div>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "transparent",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start"
            }}>
                <Navbar/>

            </div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // Questo centrerà gli elementi orizzontalmente
                justifyContent: "center", // Questo centrerà gli elementi verticalmente
                minHeight: "100vh" // Questo garantirà che l'elemento div sia almeno alto quanto la finestra visualizzata
            }}>
                <div style={{
                    position: "relative",
                    backgroundColor: "transparent",
                    padding: "15px"
                }}>
                    <div style={{
                        width: "100px",
                        height: "100px"
                    }}>
                        <GoAlertFill style={{
                            width: "100%",
                            height: "100%",
                            color: "FireBrick"
                        }}/>
                    </div>
                </div>
                <StyledTitle size={65}>
                    Work in progress !
                </StyledTitle>
                <StyledSubTitle size={27}>
                    Not finished yet
                </StyledSubTitle>
            </div>
        </div>
    );
}

export default Transactions;
