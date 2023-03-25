import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import PageContainer from '../components/PageContainer'
import ProfileImage from '../components/ProfileImage'
import PageTitle from '../components/PageTitle'
import colors from '../constants/colors'
import Input from '../components/Input'
import { addUsersToChat, updateChatData } from '../utils/actions/chatActions'
import { useReducer } from 'react'
import { useState } from 'react'
import { validateInput } from '../utils/actions/formActions'
import SubmitButton from '../components/SubmitButton'
import { useCallback } from 'react'
import { reducer } from '../utils/reducers/formReducer'
import DataItem from '../components/DataItem'
import { removeUserFromChat } from '../utils/actions/chatActions'
import { useEffect } from 'react'

const ChatSettingScreen = ({ route, navigation }) => {

    const chatId = route?.params?.chatId
    const chatData = useSelector(state => state.chats.chatsData[chatId] || {})
    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const starredMessages = useSelector(state => state.messages.starredMessages[chatId] ?? {});
    const selectedUsers = route?.params?.selectedUsers;
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const initialState = {
        inputValues: { chatName: chatData.chatName },
        inputValidities: { chatName: undefined },
        formIsValid: false
    }

    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    const addusers = async (userData, selectedUserData, chatData) => {
        await addUsersToChat(userData, selectedUserData, chatData);
    }

    useEffect(() => {
        if (!selectedUsers) {
            return;
        }

        const selectedUserData = [];
        selectedUsers.forEach(uid => {
            if (uid === userData.uid) return;

            if (!storedUsers[uid]) {
                console.log("No user data found in the data store");
                return;
            }

            selectedUserData.push(storedUsers[uid]);
        });

        addusers(userData, selectedUserData, chatData);

    }, [selectedUsers]);

    const saveHandler = useCallback(async () => {
        const updatedValues = formState.inputValues;

        try {
            setIsLoading(true);
            await updateChatData(chatId, userData.uid, updatedValues);

            setShowSuccessMessage(true);

            setTimeout(() => {
                setShowSuccessMessage(false)
            }, 1500);
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [formState]);

    const hasChanges = () => {
        const currentValues = formState.inputValues;
        return currentValues.chatName != chatData.chatName;
    }

    const leaveChat = useCallback(async () => {
        try {
            setIsLoading(true);

            await removeUserFromChat(userData, userData, chatData);
            navigation.popToTop();
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [navigation, isLoading])

    if (!chatData.users) return null;

    return (
        <PageContainer>
            <PageTitle text={"Chat Settings"} />
            <ScrollView contentContainerStyle={styles.scrollView}>
                <ProfileImage
                    showEditButton={true}
                    size={100}
                    chatId={chatId}
                    userId={userData?.uid}
                    uri={chatData?.chatImage}
                />
                <Input
                    id="chatName"
                    label="Chat name"
                    autoCapitalize="none"
                    initialValue={chatData?.chatName}
                    allowEmpty={false}
                    onInputChanged={inputChangedHandler}
                    errorText={formState.inputValidities["chatName"]}
                />
                {
                    showSuccessMessage && <Text style={{ color: colors.green, textAlign: "center", marginTop: 10 }}>Saved ✅</Text>
                }
                {
                    isLoading ?
                        <ActivityIndicator size={'small'} color={colors.primary} /> :
                        hasChanges() && <SubmitButton
                            text="Save"
                            style={{ marginTop: 20 }}
                            onPress={saveHandler}
                            disabled={!formState.formIsValid}
                        />
                }
                <View style={styles.sectionContainer}>
                    <Text style={styles.heading}>{chatData.users.length} Participants</Text>
                    <DataItem
                        title="Add Users"
                        icon="plus"
                        type="button"
                        onPress={() => navigation.navigate("NewChatScreen", { isGroupChat: true, existingUsers: chatData.users, chatId })}
                        color={colors.blue}
                    />
                    {
                        chatData.users.slice(0, 4).map(uid => {
                            const currentUser = storedUsers[uid];
                            return <DataItem
                                key={uid}
                                image={currentUser.profilePicture}
                                title={`${currentUser.firstName} ${currentUser.lastName}`}
                                subtitle={currentUser.about}
                                type={uid !== userData.userId && "link"}
                                onPress={() => uid !== userData.uid && navigation.navigate("Contacts", { uid, chatId })}
                            />
                        })
                    }
                    {
                        chatData.users.length > 4 &&
                        <DataItem
                            type={"link"}
                            title="View all"
                            hideImage={true}
                            onPress={() => navigation.navigate("DataList", { title: "Participants", data: chatData.users, type: "users", chatId })}
                        />
                    }
                    <DataItem
                        type={"link"}
                        title="Starred Messages"
                        hideImage={true}
                        onPress={() => navigation.navigate("DataList", { title: "Starred messages", data: Object.values(starredMessages), type: "messages" })}
                    />
                </View>
            </ScrollView>
            {
                <SubmitButton
                    text="Leave chat"
                    color={colors.red}
                    onPress={() => leaveChat()}
                    style={{ marginBottom: 20 }}
                />
            }
        </PageContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionContainer: {
        width: '100%',
        marginTop: 10
    },
    heading: {
        marginVertical: 8,
        color: colors.textColor,
        fontFamily: 'bold',
        letterSpacing: 0.3
    }
})

export default ChatSettingScreen