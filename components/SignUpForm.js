import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import SubmitButton from './SubmitButton';
import Input from './Input';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signUp } from '../utils/actions/authActions';
import colors from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';

const initialState = {
    inputValues: {
        firstName: '',
        lastName: '',
        number: '',
        email: '',
        password: '',
    },
    inputValidities: {
        firstName: false,
        lastName: false,
        number: false,
        email: false,
        password: false,
    },
    formIsValid: false,
}

const SignUpForm = (props) => {

    const dispatch = useDispatch()
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    useEffect(() => {
        if (error) {
            Alert.alert("An Error Occurred!", error, [{ text: "Ok" }]);
        }
    }, [error])


    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    const authHandler = useCallback(async () => {
        try {
            setIsLoading(true);
            const action = signUp(
                formState.inputValues.firstName,
                formState.inputValues.lastName,
                formState.inputValues.number,
                formState.inputValues.email,
                formState.inputValues.password
            )
            setError(null);
            await dispatch(action);
        }
        catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [dispatch, formState])

    return (
        <>
            <Input
                id="firstName"
                label="First Name"
                errorText={formState.inputValidities["firstName"]}
                icon="user-o"
                iconPack={FontAwesome} onInputChanged={inputChangedHandler} />
            <Input
                id="lastName"
                label="Last Name"
                errorText={formState.inputValidities["lastName"]}
                icon="user-o" iconPack={FontAwesome}
                onInputChanged={inputChangedHandler} />
            <Input
                id="number"
                label="Phone Number"
                errorText={formState.inputValidities["number"]} keyboardType="numeric"
                icon="phone" iconPack={FontAwesome}
                onInputChanged={inputChangedHandler} />
            <Input
                id="email"
                label="Email"
                errorText={formState.inputValidities["email"]}
                autoCapitalize="none" keyboardType="email-address"
                icon="mail"
                iconPack={Feather}
                onInputChanged={inputChangedHandler} />
            <Input
                id="password"
                label="Password"
                errorText={formState.inputValidities["password"]}
                autoCapitalize="none" secureTextEntry={true}
                icon="lock" iconPack={Feather}
                onInputChanged={inputChangedHandler} />
            {isLoading ? <ActivityIndicator size={"small"} color={colors.primary} style={{ marginTop: 10 }} />
                :
                <SubmitButton
                    style={{ marginTop: 20, }}
                    text="Create An Account"
                    onPress={authHandler}
                    disabled={!formState.formIsValid} />}
        </>
    )
}

export default SignUpForm;

const styles = StyleSheet.create({});