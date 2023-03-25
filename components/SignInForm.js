import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useReducer } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import SubmitButton from './SubmitButton';
import Input from './Input';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signIn } from '../utils/actions/authActions';
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import colors from '../constants/colors';

const isTestMode = false;

const initialState = {
    inputValues: {
        email: isTestMode ? 'abhirupkumar2003@gmail.com' : '',
        password: isTestMode ? 'Kumar@2003' : '',
    },
    inputValidities: {
        email: isTestMode,
        password: isTestMode,
    },
    formIsValid: isTestMode,
}

const SignInForm = (props) => {

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
            const action = signIn(
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
            <Input id="email" label="Email" initialValue={formState.inputValues.email} errorText={formState.inputValidities["email"]} autoCapitalize="none" keyboardType="email-address" icon="mail" iconPack={Feather} onInputChanged={inputChangedHandler} />
            <Input id="password" label="Password" initialValue={formState.inputValues.password} errorText={formState.inputValidities["password"]} autoCapitalize="none" secureTextEntry={true} icon="lock" iconPack={Feather} onInputChanged={inputChangedHandler} />
            {isLoading ? <ActivityIndicator size={"small"} color={colors.primary} style={{ marginTop: 10 }} />
                :
                <SubmitButton
                    style={{ marginTop: 20, }}
                    text="Sign In"
                    onPress={authHandler}
                    disabled={!formState.formIsValid} />}
        </>
    )
}

export default SignInForm;

const styles = StyleSheet.create({});