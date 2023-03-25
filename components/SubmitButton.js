import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import colors from '../constants/colors';

const SubmitButton = props => {

    const enabledColor = props.color || colors.primary;
    const disbledColor = colors.lightGrey;
    const bgColor = props.disabled ? disbledColor : enabledColor;

    return (
        <TouchableOpacity
            onPress={props.disabled ? () => { } : props.onPress}
            style={{ ...styles.button, ...props.style, ...{ backgroundColor: bgColor } }}
            activeOpacity={0.6}>
            <Text style={{ color: props.disabled ? colors.grey : "white", fontWeight: "bold" }}>{props.text}</Text>
        </TouchableOpacity>
    )
}

export default SubmitButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },
});