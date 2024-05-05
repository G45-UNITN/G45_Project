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
import { FiLock } from "react-icons/fi";

//loader
import { ThreeDots } from 'react-loader-spinner';

//auth & redux
import { connect } from "react-redux";
import { resetPassword } from "./../auth/actions/userActions";
import { useNavigate, useParams } from "react-router-dom";

const PasswordReset = ({resetPassword}) => {
    const navigate = useNavigate();
    const {userID, resetString} = useParams();
    return (
        <div>
            <StyledFormArea>
                <Avatar image={Logo} />
                <StyledTitle color={colors.theme} size={30}>
                    Password Reset
                </StyledTitle>
                <Formik
                    initialValues={{
                        newPassword: "",
                        confirmNewPassword: "",
                        userID,
                        resetString,
                    }}
                    validationSchema={
                        Yup.object({
                            newPassword: Yup.string().min(8, "Password is too short").max(30, "Password is too long").required("Required"),
                            confirmNewPassword: Yup.string().required("Required").oneOf([Yup.ref("newPassword")], "Passwords must match"),
                        })
                    }
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        console.log(values);
                        resetPassword(values, navigate, setFieldError, setSubmitting);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <TextInput
                                name="newPassword"
                                type="password"
                                label="New Password"
                                placeholder="********"
                                icon={<FiLock style={{marginTop:"19px"}}/>}
                            />

                            <TextInput
                                name="confirmNewPassword"
                                type="password"
                                label="Confirm New Password"
                                placeholder="********"
                                icon={<FiLock style={{marginTop:"19px"}}/>}
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

export default connect(null, {resetPassword})(PasswordReset);