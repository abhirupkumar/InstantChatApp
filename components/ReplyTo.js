import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import colors from '../constants/colors'
import { AntDesign } from '@expo/vector-icons'

const ReplyTo = ({ text, user, onCancel }) => {

    const name = `${user.firstName} ${user.lastName}`

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.name}>{name}</Text>
                <Text numberOfLines={1}>{text}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.6} onPress={onCancel}>
                <AntDesign name="closecircleo" size={18} color={colors.blue} />
            </TouchableOpacity>
        </View>
    )
}

export default ReplyTo

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.extraLightGrey,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 8,
    },
    textContainer: {
        flex: 1,
        marginRight: 5,
    },
    name: {
        color: colors.blue,
        fontFamily: "medium",
        letterSpacing: 0.3,
    },
})