import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import userImage from '../assets/images/userImage.jpeg';
import colors from '../constants/colors';
import { FontAwesome } from '@expo/vector-icons';
import { launchImagePicker, uploadImageAsync } from '../utils/imagePickerHelper';
import { useState } from 'react';
import { updateSignInUserData } from '../utils/actions/authActions';
import { updateLoggedInData } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import { updateChatData } from '../utils/actions/chatActions';

const ProfileImage = ({ size, uri, userId, showEditButton, showRemoveButton, onPress, style, chatId }) => {

    const source = uri ? { uri: uri } : userImage
    const [image, setImage] = useState(source)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()

    const picImage = async () => {
        try {
            const tempUri = await launchImagePicker()

            if (!tempUri) return;

            setIsLoading(true)
            // Upload Image
            const uploadUrl = await uploadImageAsync(tempUri, chatId !== undefined)
            setIsLoading(false)

            if (!uploadUrl) {
                throw new Error('Uploading Image Failed!')
            }

            if (chatId) {
                await updateChatData(chatId, userId, { chatImage: uploadUrl })
            }
            else {
                const updatedValues = { profilePicture: uploadUrl }

                await updateSignInUserData(userId, updatedValues)
                dispatch(updateLoggedInData(updatedValues))
            }

            // Set the Image
            setImage({ uri: uploadUrl })
        }
        catch (error) {
            console.log(error)
            setIsLoading(false)
        }

    }

    const Container = onPress || (showEditButton && showEditButton == true) ? TouchableOpacity : View
    const props = (showEditButton && showEditButton == true) ? { activeOpacity: 0.4 } : {}

    return (
        <Container style={style} props onPress={onPress || picImage}>
            {
                isLoading ? <View height={size} width={size} style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
                    :
                    <Image
                        style={{ ...styles.image, ...{ width: size, height: size } }}
                        source={image} />
            }
            {showEditButton && showEditButton == true && !isLoading && <View style={styles.editIconContainer}>
                <FontAwesome name="pencil" size={15} color="black" />
            </View>}
            {showRemoveButton && showRemoveButton == true && !isLoading && <View style={styles.removeIconContainer}>
                <FontAwesome name="close" size={15} color={colors.primary} />
            </View>}
        </Container>
    )
}

const styles = StyleSheet.create({
    image: {
        borderRadius: 50,
        borderColor: colors.grey,
        borderWidth: 1,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.lightGrey,
        borderRadius: 20,
        padding: 8,
    },
    removeIconContainer: {
        position: 'absolute',
        bottom: -3,
        right: -3,
        backgroundColor: colors.lightGrey,
        borderRadius: 20,
        padding: 3,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default ProfileImage