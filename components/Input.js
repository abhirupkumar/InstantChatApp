import { StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import colors from '../constants/colors';
import { useState } from 'react';

const Input = props => {

    const [value, setValue] = useState(props.initialValue || "")

    const onChangeText = (text) => {
        if (!props.noChange)
            setValue(text)
        props.onInputChanged && props.onInputChanged(props.id, text)
    }

    let inputContainerStyle = styles.inputContainer

    if (props.noChange) {
        inputContainerStyle = { ...inputContainerStyle, backgroundColor: colors.disbaledInputColor }
    }

    return (
        <View style={styles.container} >
            <Text style={styles.label}>{props.label}</Text>
            <View style={inputContainerStyle} >
                {props.icon && <props.iconPack name={props.icon} size={props.iconSize || 20} color="black" style={styles.icon} />}
                <TextInput {...props} style={styles.input} onChangeText={onChangeText} value={value} />
            </View>
            {props.errorText && <View style={styles.errorContainer} >
                <Text style={styles.errorText} >{props.errorText[0]}</Text>
            </View>}
        </View>
    )
}

export default Input;

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    label: {
        marginVertical: 8,
        fontFamily: "bold",
        letterSpacing: 0.3,
        color: colors.textColor,
    },
    inputContainer: {
        flexDirection: "row",
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 2,
        backgroundColor: colors.nearlyWhite,
        alignItems: "center",
    },
    icon: {
        marginRight: 10,
        color: colors.grey,
    },
    input: {
        color: colors.textColor,
        flex: 1,
        fontFamily: "regular",
        letterSpacing: 0.3,
        paddingTop: 0,
    },
    errorContainer: {
        marginVertical: 5,
    },
    errorText: {
        color: "red",
        fontSize: 13,
        fontFamily: "regular",
        letterSpacing: 0.3,
    },
});