import React, { useEffect } from 'react';
import { FlatList, Text } from 'react-native';
import { useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import * as Clipboard from 'expo-clipboard';

function formatTime(dateString) {
    const date = new Date(dateString)
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

const DataListScreen = ({ navigation, route }) => {

    const storedUsers = useSelector(state => state.users.storedUsers);
    const userData = useSelector(state => state.auth.userData);
    const messagesData = useSelector(state => state.messages.messagesData);

    const { title, data, type, chatId } = route?.params;

    useEffect(() => {
        navigation.setOptions({ headerTitle: title })
    }, [title])

    const copyToClipboard = async (text) => {
        try {
            await Clipboard.setStringAsync(text)
        }
        catch (error) {
            console.log(error)
        }
    }

    return <PageContainer>
        <FlatList
            data={data}
            keyExtractor={item => item.messageId || item}
            renderItem={(itemData) => {
                let key, onPress, image, title, subTitle, itemType;
                let date = "";
                let show = true;

                if (type === "users") {
                    const uid = itemData.item;
                    const currentUser = storedUsers[uid];

                    if (!currentUser) return;

                    const isLoggedInUser = uid === userData.uid;

                    key = uid;
                    image = currentUser.profilePicture;
                    title = `${currentUser.firstName} ${currentUser.lastName}`;
                    subTitle = currentUser.about;
                    itemType = isLoggedInUser ? undefined : "link";
                    onPress = isLoggedInUser ? undefined : () => navigation.navigate("Contacts", { uid, chatId })
                }
                else if (type === "messages") {
                    const starData = itemData.item;
                    const { chatId, messageId } = starData;
                    const messagesForChat = messagesData[chatId];

                    if (!messagesForChat) {
                        return;
                    }

                    const messageData = messagesForChat[messageId];
                    const sender = messageData && messageData.sentBy && storedUsers[messageData.sentBy];
                    const name = sender && `${sender.firstName} ${sender.lastName}`;
                    image = sender?.profilePicture;

                    key = messageId;
                    title = name;
                    subTitle = messageData && messageData.text;
                    itemType = "copyLink";
                    onPress = () => { messageData && copyToClipboard(messageData.text) }
                    if (!!messageData)
                        date = formatTime(messageData.sentAt)
                }

                return <>
                    {date != "" && <DataItem
                        key={key}
                        onPress={onPress}
                        image={image}
                        title={title}
                        subtitle={subTitle}
                        type={itemType}
                        time={date}
                    />}
                </>
            }}
        />

    </PageContainer>
};

export default DataListScreen;