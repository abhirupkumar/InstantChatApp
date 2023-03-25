import { View, Text, Platform } from 'react-native';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getFirebaseApp } from './firebaseHelper';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';

export const launchImagePicker = async () => {
    await checkMediaPermissions();

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
}

export const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
        return Promise.reject(new Error('We need permission to access your camera!'));
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
}

export const uploadImageAsync = async (uri, isChatImage = false) => {
    const app = getFirebaseApp();

    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });

    const pathFolder = isChatImage ? "chatImages" : 'profilePics';
    const storageRef = ref(getStorage(app), `${pathFolder}/${uuidv4()}`);

    await uploadBytesResumable(storageRef, blob);
    blob.close()

    return await getDownloadURL(storageRef);
}

export const checkMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            return Promise.reject(new Error('We need permission to access your phone!'));
        }
    }

    return Promise.resolve();
}