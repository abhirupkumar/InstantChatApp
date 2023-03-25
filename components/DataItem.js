import { View, Text, StyleSheet, TouchableHighlight } from 'react-native'
import React from 'react'
import ProfileImage from './ProfileImage'
import colors from '../constants/colors'
import { AntDesign, Ionicons } from '@expo/vector-icons'

const imageSize = 40;
let textColor = "black";

const DataItem = ({ title, subtitle, image, onPress, type, isChecked, hideImage, icon, color }) => {
    textColor = color ? color : textColor;
    const hide = hideImage && hideImage === true;
    return (
        <TouchableHighlight onPress={onPress} underlayColor={colors.nearlyWhite}>
            <View style={styles.container}>
                {!icon && !hide && <ProfileImage uri={image} size={imageSize} />}
                {
                    icon &&
                    <View style={styles.leftIconContainer}>
                        <AntDesign name={icon} size={20} color={colors.blue} />
                    </View>
                }
                <View style={styles.textContainer}>
                    {title && title !== "" && <Text numberOfLines={1} style={styles.title}>{title}</Text>}
                    {subtitle && <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {
                    type === 'checkbox' && <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                }
                {
                    type === "link" &&
                    <View>
                        <Ionicons name="chevron-forward-outline" size={18} color={colors.grey} />
                    </View>
                }
                {
                    type === "button2" &&
                    <View>
                        <Ionicons name="star" size={18} color={colors.gold} />
                    </View>
                }
                {
                    type === "copyLink" &&
                    <View>
                        <Ionicons name="copy-outline" size={18} color={colors.grey} />
                    </View>
                }
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 7,
        alignItems: "center",
        borderBottomColor: colors.extraLightGrey,
        borderBottomWidth: 1,
        minHeight: 50,
    },
    textContainer: {
        marginLeft: 14,
        flex: 1,
    },
    title: {
        fontFamily: 'medium',
        fontSize: 16,
        letterSpacing: 0.3,
        color: textColor,
    },
    subtitle: {
        fontFamily: 'regular',
        color: colors.grey,
        letterSpacing: 0.3,
    },
    iconContainer: {
        borderWidth: 1,
        borderRadius: 50,
        borderColor: colors.lightGrey,
        backgroundColor: "white",
    },
    checkedStyle: {
        backgroundColor: colors.primary,
        borderColor: "transparent",
    },
    leftIconContainer: {
        backgroundColor: colors.extraLightGrey,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: imageSize,
        height: imageSize
    },
})

export default DataItem;