import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import React from 'react'
import PageTitle from '../components/PageTitle'
import PageContainer from '../components/PageContainer'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { useCallback } from 'react'
import { validateInput } from '../utils/actions/formActions'
import { useReducer } from 'react'
import { reducer } from '../utils/reducers/formReducer'
import { AntDesign } from '@expo/vector-icons';
import Input from '../components/Input'
import { useDispatch, useSelector } from 'react-redux'
import SubmitButton from '../components/SubmitButton'
import { useState } from 'react'
import { updateSignInUserData, userLogout } from '../utils/actions/authActions'
import colors from '../constants/colors'
import { updateLoggedInData } from '../store/authSlice'
import ProfileImage from '../components/ProfileImage'
import { useMemo } from 'react'
import DataItem from '../components/DataItem'

const SettingsScreen = ({ navigation }) => {

    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
    const userData = useSelector(state => state.auth.userData)
    const starredMessages = useSelector(state => state.messages.starredMessages ?? {});

    const sortedStarredMessages = useMemo(() => {
        let result = [];

        const chats = Object.values(starredMessages);

        chats.forEach(chat => {
            const chatMessages = Object.values(chat);
            result = result.concat(chatMessages);
        })

        return result;
    }, [starredMessages]);

    const firstName = userData.firstName
    const lastName = userData.lastName
    const email = userData.email
    const about = userData.about || ""

    const initialState = {
        inputValues: {
            firstName,
            lastName,
            email,
            about,
        },
        inputValidities: {
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            about: undefined,
        },
        formIsValid: false,
    }
    const [formState, dispatchFormState] = useReducer(reducer, initialState);
    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    const saveHandler = useCallback(async () => {
        const updatedValues = formState.inputValues;

        try {
            setIsLoading(true)
            await updateSignInUserData(userData.uid, updatedValues)
            dispatch(updateLoggedInData(updatedValues))
            setShowSuccessMessage(true)

            setTimeout(() => {
                setShowSuccessMessage(false)
            }, 3000)
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setIsLoading(false)
        }
    }, [formState, dispatch]);

    const hasChanges = () => {
        const currentValues = formState.inputValues;
        return currentValues.firstName !== firstName || currentValues.lastName !== lastName || currentValues.email !== email || currentValues.about !== about;
    }

    return (
        <PageContainer>
            <PageTitle text="Settings" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContainer}>

                <ProfileImage size={100} userId={userData.uid} uri={userData.profilePicture} showEditButton={true} />

                <Input
                    id="firstName"
                    label="First Name"
                    errorText={formState.inputValidities["firstName"]}
                    icon="user-o"
                    iconPack={FontAwesome} onInputChanged={inputChangedHandler}
                    initialValue={userData.firstName} />
                <Input
                    id="lastName"
                    label="Last Name"
                    errorText={formState.inputValidities["lastName"]}
                    icon="user-o" iconPack={FontAwesome}
                    onInputChanged={inputChangedHandler}
                    initialValue={userData.lastName} />
                <Input
                    id="email"
                    label="Email"
                    errorText={formState.inputValidities["email"]}
                    autoCapitalize="none" keyboardType="email-address"
                    icon="mail"
                    iconPack={Feather}
                    initialValue={userData.email}
                    noChange={true} />
                <Input
                    id="about"
                    label="About"
                    errorText={formState.inputValidities["about"]}
                    icon="infocirlceo" iconPack={AntDesign}
                    onInputChanged={inputChangedHandler}
                    initialValue={userData.about} />
                <View style={{ marginTop: 20 }}>
                    {
                        showSuccessMessage && <Text style={{ color: colors.green, textAlign: "center", marginTop: 10 }}>Saved ✅</Text>
                    }
                    {isLoading ? <ActivityIndicator size={"small"} color={colors.primary} style={{ marginTop: 10 }} />
                        :
                        hasChanges() && <SubmitButton
                            style={{ marginTop: 20 }}
                            text="Save"
                            onPress={saveHandler}
                            disabled={!formState.formIsValid} />}
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("DataList", { title: "Starred messages", data: sortedStarredMessages, type: "messages" })}>
                    <Text style={{ color: colors.blue }}>Starred messages ⭐</Text>
                </TouchableOpacity>
                <SubmitButton
                    style={{ marginTop: 30 }}
                    text="Logout"
                    color={colors.red}
                    onPress={() => dispatch(userLogout())} />
            </ScrollView>
        </PageContainer>
    )
}

export default SettingsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        alignItems: "center",
        width: "100%",
    },
})