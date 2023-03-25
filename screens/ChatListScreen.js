import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { useEffect } from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import { useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';

const ChatListScreen = ({ navigation, route }) => {

    const selectedUser = route?.params?.selectedUserId;
    const selectedUserList = route?.params?.selectedUsers;
    let chatName = route?.params?.chatName;
    const userData = useSelector(state => state.auth.userData)
    const userChats = useSelector(state => {
        const chatsData = state.chats.chatsData;
        return Object.values(chatsData).sort((a, b) => { return new Date(b.updatedAt) - new Date(a.updatedAt) })
    })
    const storedUsers = useSelector(state => state.users.storedUsers)

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CustomHeaderButton} >
                    <Item title="New Chat" iconName="create-outline" onPress={() => navigation.navigate("NewChatScreen")} />
                </HeaderButtons>
            ),
        });
    }, [])

    useEffect(() => {
        if (!selectedUser && !selectedUserList) {
            return;
        }

        let chatData;
        let navigationProps;

        if (selectedUser) {
            chatData = userChats.find(cd => !cd.isGroupChat && cd.users.includes(selectedUser))
        }


        if (chatData) {
            navigationProps = { chatId: chatData.key }
        }
        else {
            const chatUsers = selectedUserList || [selectedUser]
            if (!chatUsers.includes(userData.uid)) {
                chatUsers.push(userData.uid)
            }
            if (chatName !== undefined) {
                navigationProps = {
                    newChatData: { users: chatUsers, isGroupChat: selectedUserList !== undefined, chatName }
                }
            }
            else {
                navigationProps = {
                    newChatData: { users: chatUsers, isGroupChat: selectedUserList !== undefined }
                }
            }
        }
        navigation.navigate("ChatScreen", navigationProps);
    }, [route?.params])

    return (
        <PageContainer>
            <PageTitle text="Chats" />
            <View style={styles.newGroupContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("NewChatScreen", { isGroupChat: true })}>
                    <Text style={styles.newGroupText}>New Group</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={userChats}
                renderItem={(itemData) => {
                    const chatData = itemData.item;
                    const chatId = chatData.key;
                    const isGroupChat = chatData.isGroupChat;
                    let subtitle = chatData.latestMessageText || "New Chat";
                    let title = "";
                    let image = "";
                    if (isGroupChat) {
                        title = chatData?.chatName;
                        image = chatData?.chatImage
                    }
                    else {
                        const otherUserId = chatData.users.find(uid => uid !== userData.uid);
                        const otherUser = storedUsers[otherUserId];
                        if (!otherUser) return;
                        title = `${otherUser.firstName} ${otherUser.lastName}`
                        image = otherUser.profilePicture
                    }
                    return <DataItem
                        title={title}
                        subtitle={subtitle}
                        image={image}
                        onPress={() => navigation.navigate("ChatScreen", { chatId })}
                    />
                }}
            />
        </PageContainer>
    )
}

export default ChatListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newGroupContainer: {
        alignItems: "flex-end",
        marginBottom: 5,
    },
    newGroupText: {
        color: colors.blue,
        fontSize: 17,
        marginBottom: 7,
    },
})