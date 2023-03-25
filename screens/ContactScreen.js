import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import colors from '../constants/colors';
import ProfileImage from '../components/ProfileImage';
import PageTitle from '../components/PageTitle';
import { useEffect } from 'react';
import { getUserChats } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import SubmitButton from '../components/SubmitButton';
import { useCallback } from 'react';
import { removeUserFromChat } from '../utils/actions/chatActions';

const ContactScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const userData = useSelector(state => state.auth.userData);
    const currentUser = storedUsers[route?.params?.uid];
    const storedChats = useSelector(state => state.chats.chatsData);
    const [commonChats, setCommonChats] = useState([]);

    const chatId = route?.params?.chatId;
    const chatData = chatId && storedChats[chatId];

    useEffect(() => {

        const getCommonUserChats = async () => {
            const currentUserChats = await getUserChats(currentUser.uid);
            setCommonChats(
                Object.values(currentUserChats).filter(cid => storedChats[cid] && storedChats[cid].isGroupChat)
            )
        }

        getCommonUserChats();

    }, [])

    const removeFromChat = useCallback(async () => {
        try {
            setIsLoading(true);

            await removeUserFromChat(userData, currentUser, chatData);

            navigation.goBack();
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [navigation, isLoading])

    return (
        <PageContainer>
            <View style={styles.topContainer}>
                <ProfileImage
                    uri={currentUser.profilePicture}
                    size={100}
                    style={{ marginBottom: 20 }}
                />
                <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
                {
                    currentUser.about &&
                    <Text style={styles.about} numberOfLines={2}>{currentUser.about}</Text>
                }
            </View>
            {
                commonChats.length > 0 &&
                <>
                    <Text style={styles.heading}>{commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"} in Common</Text>
                    {
                        commonChats.map(cid => {
                            const chatData = storedChats[cid];
                            return <DataItem
                                key={cid}
                                title={chatData.chatName}
                                subtitle={chatData.latestMessageText}
                                type="link"
                                onPress={() => navigation.push("ChatScreen", { chatId: cid })}
                                image={chatData.chatImage}
                            />
                        })
                    }
                </>
            }
            {
                chatData && chatData.isGroupChat &&
                (
                    isLoading ?
                        <ActivityIndicator size='small' color={colors.primary} /> :
                        <SubmitButton
                            text="Remove from chat"
                            color={colors.red}
                            onPress={removeFromChat}
                        />
                )
            }
        </PageContainer>
    )
}

export default ContactScreen

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
    },
    about: {
        fontFamily: 'medium',
        fontSize: 16,
        letterSpacing: 0.3,
        color: colors.grey
    },
    heading: {
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: colors.textColor,
        marginVertical: 8
    }
});