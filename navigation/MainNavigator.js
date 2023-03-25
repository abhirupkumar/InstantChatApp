import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import React, { useRef } from 'react';
import ChatSettingScreen from '../screens/ChatSettingScreen';
import ChatListScreen from '../screens/ChatListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../screens/ChatScreen';
import colors from '../constants/colors';
import NewChatScreen from '../screens/NewChatScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getFirebaseApp } from '../utils/firebaseHelper';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { setChatsData } from '../store/chatSlice';
import { useState } from 'react';
import commonStyles from '../constants/commonStyles';
import { setStoredUsers } from '../store/userSlice';
import { setChatMessages, setStarredMessages } from '../store/messagesSlice';
import ContactScreen from '../screens/ContactScreen';
import DataListScreen from '../screens/DataListScreen';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            headerTitle: "",
            headerShadowVisible: false,
            tabBarIcon: ({ focused }) => {
                let iconName, color;

                if (route.name === 'ChatList') {
                    iconName = focused
                        ? 'chatbubble'
                        : 'chatbubble-outline';
                    color = focused
                        ? colors.blue
                        : 'black';
                } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                    color = focused ? colors.blue : 'black';
                }

                return <Ionicons name={iconName} size={24} color={color} />;
            },
            tabBarActiveTintColor: colors.blue,
            tabBarInactiveTintColor: 'black',
        })}>
            <Tab.Screen name="ChatList" component={ChatListScreen} options={{
                tabBarLabel: "Chats",
            }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{
                tabBarLabel: "Settings",
            }} />
        </Tab.Navigator>
    )
}

const StackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
            <Stack.Group>
                <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} options={{
                    gestureEnabled: true,
                    headerTitle: "",
                    animationEnabled: true,
                }} />
                <Stack.Screen name="ChatSettings" component={ChatSettingScreen} options={{
                    gestureEnabled: true,
                    headerTitle: "",
                    animationEnabled: true,
                    headerShadowVisible: false,
                }} />
                <Stack.Screen name="Contacts" component={ContactScreen} options={{
                    gestureEnabled: true,
                    headerTitle: "Contacts",
                    animationEnabled: true,
                }} />
                <Stack.Screen
                    name="DataList"
                    component={DataListScreen}
                    options={{
                        headerTitle: "",
                        headerBackTitle: "Back",
                    }}
                />
            </Stack.Group>
            <Stack.Group screenOptions={{
                presentation: "containedModal",
            }}>
                <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
            </Stack.Group>
        </Stack.Navigator>
    )
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});


const MainNavigator = () => {

    const userData = useSelector(state => state.auth.userData)
    const storedUsers = useSelector(state => state.users.storedUsers)
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(true)
    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userChatsRef = child(dbRef, `userChats/${userData.uid}`);
        const refs = [userChatsRef]
        onValue(userChatsRef, (querySnapshot) => {
            const chatIdsData = querySnapshot.val() || {};
            const chatIds = Object.values(chatIdsData);
            let chatsData = {};
            let chatsFoundCount = 0;
            for (let i = 0; i < chatIds.length; i++) {
                const chatId = chatIds[i];
                const chatRef = child(dbRef, `chats/${chatId}`);
                refs.push(chatRef)

                onValue(chatRef, (chatSnapshot) => {
                    chatsFoundCount++;
                    const data = chatSnapshot.val();

                    if (data) {
                        if (!data.users.includes(userData.uid)) return;

                        data.key = chatSnapshot.key;
                        data.users.forEach(uid => {
                            if (storedUsers[uid]) {
                                return;
                            }

                            const userRef = child(dbRef, `users/${uid}`);
                            get(userRef).then(userSnapshot => {
                                const userSnapshotData = userSnapshot.val();
                                if (userSnapshotData) {
                                    dispatch(setStoredUsers({ newUsers: { userSnapshotData } }))
                                }
                            })
                            refs.push(userRef)
                        })
                        chatsData[chatSnapshot.key] = data;

                    }
                    if (chatsFoundCount >= chatIds.length) {
                        dispatch(setChatsData({ chatsData }));
                        setIsLoading(false);
                    }
                })

                const messagesRef = child(dbRef, `messages/${chatId}`);
                refs.push(messagesRef);

                onValue(messagesRef, (messagesSnapshot) => {
                    const messagesData = messagesSnapshot.val() || {};
                    dispatch(setChatMessages({ chatId, messagesData }));
                })

                if (chatsFoundCount == 0) {
                    setIsLoading(false);
                }

            }
        })

        const userStarredMessagesRef = child(dbRef, `userStarredMessages/${userData.uid}`);
        refs.push(userStarredMessagesRef);
        onValue(userStarredMessagesRef, (querySnapshot) => {
            const starredMessages = querySnapshot.val() ?? {};
            dispatch(setStarredMessages({ starredMessages }));
        })

        return () => {
            refs.forEach(ref => off(ref))
        }
    }, [])

    if (isLoading) {
        return <View style={commonStyles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    }

    return (
        <KeyboardAvoidingView style={{
            flex: 1
        }}
            behaviour={Platform.OS === 'ios' ? "padding" : undefined}
            keyboardVerticalOffset={100}>
            <StackNavigator />
        </KeyboardAvoidingView>
    )
}

export default MainNavigator;