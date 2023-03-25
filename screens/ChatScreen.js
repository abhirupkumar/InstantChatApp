import { View, Text, ImageBackground, StyleSheet, TextInput, Button, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import backgroundImage from '../assets/images/wallpaper.jpg';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import Bubble from '../components/Bubble';
import { createChat, sendImage, sendTextMessage } from '../utils/actions/chatActions';
import ReplyTo from '../components/ReplyTo';
import { launchImagePicker, openCamera, uploadImageAsync } from '../utils/imagePickerHelper';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRef } from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';

const ChatScreen = ({ navigation, route }) => {

    const [chatUsers, setChatUsers] = useState([])
    const [messageText, setMessageText] = useState("");
    const [chatId, setChatId] = useState(route?.params?.chatId)
    const [errorBannerText, setErrorBannerText] = useState("")
    const [replyingTo, setReplyingTo] = useState()
    const [tempImageUri, setTempImageUri] = useState("")
    const [isloading, setIsloading] = useState(false)
    const userData = useSelector(state => state.auth.userData)
    const storedUsers = useSelector(state => state.users.storedUsers)
    const storedChats = useSelector(state => state.chats.chatsData)
    const scrollViewRef = useRef();
    const chatMessages = useSelector(state => {
        if (!chatId) return []
        const chatMessagesData = state.messages.messagesData[chatId]
        if (!chatMessagesData) return []
        const messageList = []
        for (let key in chatMessagesData) {
            const message = chatMessagesData[key]
            messageList.push({ key, ...message })
        }
        return messageList
    })

    const chatData = (chatId && storedChats[chatId]) || route?.params?.newChatData || {}

    const getChatTitleFromName = () => {
        const otherUserId = chatUsers.find(uid => uid !== userData.uid)
        const otherUserData = storedUsers[otherUserId]

        return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    }

    useEffect(() => {
        if (!chatData) return;
        navigation.setOptions({
            headerTitle: chatData.chatName ?? getChatTitleFromName(),
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                    {
                        chatId &&
                        <Item
                            title="Chat settings"
                            iconName="settings-outline"
                            onPress={() => chatData.isGroupChat ?
                                navigation.navigate("ChatSettings", { chatId }) :
                                navigation.navigate("Contacts", { uid: chatUsers.find(uid => uid !== userData.uid) })}
                        />
                    }
                </HeaderButtons>
            ),
        });
        setChatUsers(chatData.users)
    }, [chatUsers])

    const sendMessage = useCallback(async () => {
        try {
            let id = chatId
            if (!id) {
                //no chat id, create new chat
                id = await createChat(userData.uid, route?.params?.newChatData)
                setChatId(id);
            }
            await sendTextMessage(id, userData.uid, messageText, replyingTo && replyingTo.key)
            setMessageText("");
            setReplyingTo(null)
        }
        catch (error) {
            setErrorBannerText("Failed to send a message.")
            console.log(error)
            setTimeout(() => {
                setErrorBannerText("")
            }, 5000)
        }
    }, [messageText, chatId])

    const pickImage = useCallback(async () => {
        try {
            const tempUri = await launchImagePicker(tempImageUri)
            if (!tempUri) return;
            setTempImageUri(tempUri);
        }
        catch (err) {
            console.log(err)
        }
    }, [tempImageUri])

    const takePhoto = useCallback(async () => {
        try {
            const tempUri = await openCamera()
            if (!tempUri) return;
            setTempImageUri(tempUri);
        }
        catch (err) {
            console.log(err)
        }
    }, [tempImageUri])

    const uploadImage = useCallback(async () => {
        setIsloading(true)
        let id = chatId
        if (!id) {
            //no chat id, create new chat
            id = await createChat(userData.uid, route?.params?.newChatData)
            setChatId(id);
        }
        try {
            const uploadUrl = await uploadImageAsync(tempImageUri, true)
            setIsloading(false)
            await sendImage(id, userData.uid, uploadUrl, replyingTo && replyingTo.key)
            setReplyingTo(null)
            setTimeout(() => {
                setTempImageUri("")
            }, 500)
        } catch (error) {
            setIsloading(false)
            console.log(error)
        }
    }, [isloading, chatId, tempImageUri])

    return (
        <SafeAreaView edges={['right', 'left', 'bottom']} style={styles.container}>
            <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}
                >
                    <PageContainer bgColor="transparent">
                        {
                            !chatId && <Bubble text="You guys haven't talked a bit. Say hi!" type="system" />
                        }
                        {
                            errorBannerText !== "" && <Bubble text={errorBannerText} type="error" />
                        }
                        {
                            chatId && <FlatList
                                data={chatMessages}
                                renderItem={(itemData) => {
                                    const message = itemData.item
                                    const isOwnMessage = message.sentBy === userData.uid

                                    let messageType;
                                    if (message.type && message.type === "info") {
                                        messageType = "info";
                                    }
                                    else if (isOwnMessage) {
                                        messageType = "myMessage";
                                    }
                                    else {
                                        messageType = "theirMessage";
                                    }

                                    const sender = message.sentBy && storedUsers[message.sentBy]
                                    const name = sender && `${sender.firstName} ${sender.lastName}`

                                    return <Bubble
                                        text={message.text}
                                        type={messageType}
                                        messageId={message.key}
                                        userId={userData.uid}
                                        chatId={chatId}
                                        date={message.sentAt}
                                        name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                                        setReply={() => setReplyingTo(message)}
                                        replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)} imageUrl={message.imageUrl}
                                    />
                                }}
                            />
                        }
                    </PageContainer>
                </ScrollView>
                {
                    replyingTo && <ReplyTo text={replyingTo.text} user={storedUsers[replyingTo.sentBy]} onCancel={() => setReplyingTo(null)} />
                }
            </ImageBackground>
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <AntDesign name="pluscircle" size={24} color={colors.grey} />
                </TouchableOpacity>
                <TextInput style={styles.textbox} value={messageText} onSubmitEditing={sendMessage} multiline={true} onChangeText={text => setMessageText(text)} />
                {messageText === "" ? <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={30} color={colors.grey} />
                </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.mediaButton} onPress={sendMessage}>
                        <MaterialCommunityIcons name="send-circle" size={35} color={colors.bluishGray} />
                    </TouchableOpacity>}
                <AwesomeAlert
                    show={tempImageUri !== ""}
                    title={"Send Image?"}
                    closeOnTouchOutside={true}
                    closeOnHardwareBackPress={true}
                    showCancelButton={true}
                    showConfirmButton={true}
                    cancelText="Cancel"
                    confirmText="Send"
                    confirmButtonColor={colors.primary}
                    cancelButtonColor={colors.grey}
                    titleStyle={styles.popupTitleStyle}
                    onCancelPressed={() => setTempImageUri("")}
                    onConfirmPressed={uploadImage}
                    onDismiss={() => setTempImageUri("")}
                    customView={
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                            {
                                isloading && <ActivityIndicator size="large" color={colors.primary} />
                            }
                            {!isloading && tempImageUri !== "" && <Image source={{ uri: tempImageUri }} style={{ width: 300, height: 300 }} />}
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    )
}

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    backgroundImage: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        paddingVertical: 6,
        paddingHorizontal: 4,
        height: 55,
    },
    textbox: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 50,
        borderColor: colors.lightGrey,
        marginHorizontal: 6,
        paddingHorizontal: 12,
    },
    mediaButton: {
        alignItems: "center",
        justifyContent: "center",
        width: 35,
    },
    popupTitleStyle: {
        fontFamily: "medium",
        letterSpacing: 0.3,
        color: colors.textColor,
    },
})