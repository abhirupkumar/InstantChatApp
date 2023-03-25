import { StyleSheet, Text, View, Button, TextInput, ActivityIndicator, FlatList } from 'react-native';
import React from 'react';
import { useEffect } from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import PageContainer from '../components/PageContainer';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useState } from 'react';
import commonStyles from '../constants/commonStyles';
import { searchUsers } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import { useDispatch, useSelector } from 'react-redux';
import { setStoredUsers } from '../store/userSlice';
import ProfileImage from '../components/ProfileImage';

const NewChatScreen = ({ navigation, route }) => {

    const dispatch = useDispatch()
    const userData = useSelector(state => state.auth.userData)
    const storedUsers = useSelector(state => state.users.storedUsers)
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState()
    const [noResultsFound, setNoResultsFound] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [chatName, setChatName] = useState('')
    const existingUsers = route?.params?.existingUsers;
    const isGroupChat = route?.params?.isGroupChat;
    const isGroupChatDisabled = selectedUsers.length === 0 || (isNewChat && chatName === "");
    const chatId = route?.params?.chatId;

    const isNewChat = !chatId;
    useEffect(() => {
        navigation.setOptions({
            headerTitle: isGroupChat ? "Add Participants" : "New Chat",
            headerLeftIconShouldNotBeVisible: true,
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CustomHeaderButton} >
                    {isGroupChat && <Item title={isNewChat ? "Create" : "Add"} disabled={isGroupChatDisabled} color={isGroupChatDisabled ? colors.lightGrey : undefined}
                        onPress={() => {
                            const screenName = isNewChat ? "ChatList" : "ChatSettings";
                            navigation.navigate(screenName, { selectedUsers, chatName, chatId })
                        }} />}
                </HeaderButtons>
            ),
        });
    }, [chatName, selectedUsers])

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (!searchTerm || searchTerm === "") {
                setIsLoading(true);
                const allUsersResult = await searchUsers("")
                setUsers(allUsersResult);
                setIsLoading(false);
                setNoResultsFound(false);
                dispatch(setStoredUsers({ newUsers: allUsersResult }))
                return;
            }
            setIsLoading(true);
            const usersResult = await searchUsers(searchTerm);
            delete usersResult[userData.uid];
            setUsers(usersResult);
            if (Object.keys(usersResult).length == 0) {
                setNoResultsFound(true);
            }
            else {
                setNoResultsFound(false);
                dispatch(setStoredUsers({ newUsers: usersResult }))
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm])

    const userPressed = (userId) => {
        if (isGroupChat) {
            const newSelectedUser = selectedUsers.includes(userId) ? selectedUsers.filter(id => id !== userId) : selectedUsers.concat(userId);
            setSelectedUsers(newSelectedUser);
        }
        else {
            navigation.navigate('ChatList', { selectedUserId: userId })
        }
    }

    return (
        <PageContainer>
            {
                isGroupChat && <>
                    <View style={styles.chatNameContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder='Enter a group name'
                                style={styles.textbox}
                                autoCorrect={false}
                                onChangeText={text => setChatName(text)}
                            />
                        </View>
                    </View>

                    <View style={styles.selectedUsersContainer}>
                        <FlatList
                            style={styles.selectedUsersList}
                            data={selectedUsers}
                            horizontal={true}
                            keyExtractor={item => item}
                            contentContainerStyle={{ alignItems: "center" }}
                            renderItem={(itemData) => {
                                const userId = itemData.item;
                                const userData = storedUsers[userId];

                                return <ProfileImage
                                    style={styles.selectedUsersStyle}
                                    size={40}
                                    uri={userData.profilePicture}
                                    onPress={() => userPressed(userId)}
                                    showRemoveButton={true}
                                />
                            }}
                        />
                    </View>
                </>
            }
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={15} color={colors.lightGrey} />
                <TextInput placeholder='Search' style={styles.searchBox} onChangeText={text => setSearchTerm(text)} />
            </View>
            {
                isLoading && (
                    <View style={commonStyles.center}>
                        <ActivityIndicator color={colors.lightGrey} size={55} />
                        <Text style={styles.noResultsText}>Searching...</Text>
                    </View>
                )
            }
            {
                !isLoading && !noResultsFound && users && <FlatList
                    data={Object.keys(users)}
                    renderItem={({ item }) => {

                        if (existingUsers && existingUsers.includes(item)) {
                            return;
                        }

                        return <DataItem
                            title={`${users[item].firstName} ${users[item].lastName}`}
                            subtitle={users[item].about} image={users[item].profilePicture}
                            onPress={() => userPressed(users[item].uid)}
                            type={isGroupChat ? "checkbox" : ""}
                            isChecked={selectedUsers.includes(users[item].uid)}
                        />
                    }}
                />
            }
            {
                !isLoading && !users && (
                    <View style={commonStyles.center}>
                        <FontAwesome name="users" size={55} color={colors.lightGrey} style={styles.noResultsIcon} />
                        <Text style={styles.noResultsText}>Enter a name to search for a user</Text>
                    </View>
                )
            }
            {
                !isLoading && noResultsFound && (
                    <View style={commonStyles.center}>
                        <FontAwesome name="question" size={55} color={colors.lightGrey} style={styles.noResultsIcon} />
                        <Text style={styles.noResultsText}>No Users Found</Text>
                    </View>
                )
            }
        </PageContainer >
    )
}

export default NewChatScreen;

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.extraLightGrey,
        height: 30,
        marginVertical: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 5,
    },
    searchBox: {
        marginLeft: 8,
        fontSize: 15,
        width: "100%",
    },
    noResultsIcon: {
        marginBottom: 20,
    },
    noResultsText: {
        color: colors.textColor,
        fontFamily: 'regular',
        letterSpacing: 0.3,
    },
    chatNameContainer: {
        paddingVertical: 10,
    },
    inputContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: colors.nearlyWhite,
        flexDirection: "row",
        borderRadius: 2,
    },
    textbox: {
        color: colors.textColor,
        width: "100%",
        fontFamily: 'regular',
        letterSpacing: 0.3,
    },
    selectedUsersContainer: {
        height: 50,
        justifyContent: "center",
    },
    selectedUsersList: {
        height: "100%",
    },
    selectedUsersStyle: {
        marginRight: 10,
        marginBottom: 10,
    }
})