import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import colors from '../constants/colors'

export default function PageTitle({ text }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    text: {
        fontSize: 28,
        color: colors.textColor,
        fontFamily: "bold",
        letterSpacing: 0.3,
    }
})