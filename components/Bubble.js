import { View, Text, StyleSheet, TouchableWithoutFeedback, Image, TouchableHighlight, ActivityIndicator } from 'react-native'
import React from 'react'
import colors from '../constants/colors'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { useRef } from 'react'
import uuid from 'react-native-uuid'
import * as Clipboard from 'expo-clipboard'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { starMessage } from '../utils/actions/chatActions'
import { useSelector } from 'react-redux';
import { useState } from 'react'
import AwesomeAlert from 'react-native-awesome-alerts'

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

const MenuItem = ({ text, onSelect, iconPack, icon }) => {
    const Icon = iconPack ?? Feather
    return (
        <MenuOption onSelect={onSelect}>
            <View style={styles.menuItemContainer}>
                <Icon name={icon} size={16} color="black" style={{ marginRight: 10 }} />
                <Text style={styles.menuItemText}>{text}</Text>
            </View>
        </MenuOption>
    )
}

const Bubble = ({ text, type, messageId, chatId, userId, date, setReply, replyingTo, name, imageUrl }) => {

    const starredMessages = useSelector(state => state.messages.starredMessages[chatId] ?? {})
    const storedUsers = useSelector(state => state.users.storedUsers)
    const wrapperStyle = { ...styles.wrapperStyle }
    const bubbleStyle = { ...styles.containerStyle }
    const textStyle = { ...styles.text }

    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)
    const id = useRef(uuid.v4())

    let Container = View;
    let isUserMessage = false;
    const dateString = date && formatTime(date)

    switch (type) {
        case "system":
            textStyle.color = '#656448'
            bubbleStyle.backgroundColor = colors.beige
            bubbleStyle.alignItems = "center"
            bubbleStyle.marginTop = 10
            break;

        case "error":
            textStyle.color = 'white'
            bubbleStyle.backgroundColor = "#f94449"
            bubbleStyle.alignItems = "center"
            bubbleStyle.marginTop = 10
            break;

        case "myMessage":
            wrapperStyle.justifyContent = "flex-end"
            bubbleStyle.backgroundColor = "#E0FFFF"
            bubbleStyle.maxWidth = "90%"
            Container = TouchableWithoutFeedback
            isUserMessage = true
            break;

        case "theirMessage":
            wrapperStyle.justifyContent = "flex-start"
            bubbleStyle.maxWidth = "90%"
            Container = TouchableWithoutFeedback
            isUserMessage = true
            break;

        case "reply":
            bubbleStyle.backgroundColor = "#F8FFFD"
            break;

        case "info":
            bubbleStyle.backgroundColor = 'white';
            bubbleStyle.alignItems = 'center';
            textStyle.color = colors.textColor;
            break;

        default:
            break;
    }

    const copyToClipboard = async (text) => {
        try {
            await Clipboard.setStringAsync(text)
        }
        catch (error) {
            console.log(error)
        }
    }

    const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
    const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy]

    return (
        <View style={wrapperStyle}>
            <Container onLongPress={() => { menuRef.current.props.ctx.menuActions.openMenu(id.current) }} style={{ width: "100%" }}>
                <View style={bubbleStyle}>
                    {
                        name && <Text style={styles.name}>{name}</Text>
                    }
                    {
                        replyingToUser && <Bubble
                            type="reply"
                            text={replyingTo.text}
                            name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
                        />
                    }
                    {!imageUrl && <Text style={textStyle}>
                        {text}
                    </Text>}
                    {
                        imageUrl &&
                        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode='contain' />
                    }
                    {
                        dateString && <View style={styles.timeContainer}>
                            {isStarred && <FontAwesome name="star" size={12} color={colors.gold} style={{ marginRight: 10 }} />}
                            {type !== "info" && <Text style={styles.time}>{dateString}</Text>}
                        </View>
                    }
                    <Menu name={id.current} ref={menuRef}>
                        <MenuTrigger />
                        <MenuOptions>
                            <MenuItem text="Copy" icon={"copy"} onSelect={() => copyToClipboard(text)} />
                            <MenuItem text={`${isStarred ? "Unstar" : "Star"} message`} iconPack={FontAwesome} icon={isStarred ? "star" : "star-o"} onSelect={() => starMessage(messageId, chatId, userId)} />
                            <MenuItem text="Reply" icon={"corner-up-left"} onSelect={setReply} />
                        </MenuOptions>
                    </Menu>
                </View>
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    menuItemContainer: {
        flexDirection: "row",
        padding: 2,
        alignItems: "center",
    },
    menuItemText: {
        flex: 1,
        fontFamily: 'regular',
        letterSpacing: 0.3,
        fontSize: 13,
    },
    wrapperStyle: {
        flexDirection: "row",
        justifyContent: "center",
    },
    containerStyle: {
        backgroundColor: "white",
        borderRadius: 6,
        padding: 5,
        marginBottom: 10,
        borderColor: "#E2DACC",
        borderWidth: 1,
    },
    text: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    time: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
        fontSize: 12,
        color: colors.grey,
    },
    name: {
        fontFamily: 'medium',
        letterSpacing: 0.3,
        color: colors.grey,
        marginBottom: 5,
    },
    image: {
        width: 300,
        height: 400,
        marginBottom: 5,
        objectFit: "contain",
    },
    popupTitleStyle: {
        fontFamily: "medium",
        letterSpacing: 0.3,
        color: colors.textColor,
    },
})

export default Bubble