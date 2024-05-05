//styled components
import {
    StyledFormArea,
    StyledFormButton,
    Avatar,
    StyledTitle,
    colors,
    ButtonGroup,
    CopyrightText
}
    from "./../components/Styles";

import Logo from "./../assets/logo.png";

//formik
import { Formik, Form } from "formik";
import { TextInput } from "./../components/FormLib";
import * as Yup from "yup";

//icons
import { FiMail } from "react-icons/fi";

//loader
import { ThreeDots } from 'react-loader-spinner';

//auth & redux
import { connect } from "react-redux";
import {forgottenPassword} from "./../auth/actions/userActions";
import { useNavigate, useParams } from "react-router-dom";

const ForgottenPass = ({forgottenPassword}) => {
    const navigate = useNavigate();
    const {userEmail} = useParams();
    return (
        <div>
            <StyledFormArea>
                <Avatar image={Logo} />
                <StyledTitle color={colors.theme} size={30}>
                    Password Reset
                </StyledTitle>
                <Formik
                    initialValues={{
                        email: userEmail,
                        redirectUrl: "http://localhost:3000/passwordreset"
                    }}
                    validationSchema={
                        Yup.object({
                            email: Yup.string().email("Invalid email address").required("Required"),
                        })
                    }
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        console.log(values);
                        forgottenPassword(values, navigate, setFieldError, setSubmitting);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <TextInput
                                name="email"
                                type="text"
                                label="Enter your email Address"
                                placeholder="example@domain.com"
                                icon={<FiMail style={{marginTop:"19px"}}/>}
                            />


                            <ButtonGroup>
                                {!isSubmitting && (
                                    <StyledFormButton type="submit">
                                        Submit
                                    </StyledFormButton>)}

                                {isSubmitting && (
                                    <ThreeDots
                                        height="80"
                                        width="80"
                                        radius="9"
                                        color= {colors.theme2}
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClassName=""
                                        visible={true}
                                    />
                                )}
                            </ButtonGroup>
                        </Form>
                    )}
                </Formik>
            </StyledFormArea>
            <CopyrightText>
                All rights reserved &copy; 2023
            </CopyrightText>
        </div>
    )
}

export default connect(null, {forgottenPassword})(ForgottenPass);