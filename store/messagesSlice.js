import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        messagesData: {},
        starredMessages: {},
    },
    reducers: {
        setChatMessages: (state, action) => {
            const existingMessages = state.messagesData;
            const { chatId, messagesData } = action.payload
            existingMessages[chatId] = messagesData;
            state.messagesData = existingMessages;
        },
        removeChatMessages: (state, action) => {
            state.messagesData = {}
        },
        addStarredMessage: (state, action) => {
            const { starredMessageData } = action.payload
            state.starredMessages[starredMessageData.messageId] = starredMessageData;
        },
        removeStarredMessage: (state, action) => {
            const { messageId } = action.payload
            delete state.starredMessages[messageId];
        },
        setStarredMessages: (state, action) => {
            const { starredMessages } = action.payload
            state.starredMessages = {
                ...starredMessages
            };
        },
        removeStarredMessages: (state, action) => {
            state.starredMessages = {};
        },
    }
})

export const setChatMessages = messagesSlice.actions.setChatMessages;
export const addStarredMessage = messagesSlice.actions.addStarredMessage;
export const removeStarredMessage = messagesSlice.actions.removeStarredMessage;
export const setStarredMessages = messagesSlice.actions.setStarredMessages;
export const removeChatMessages = messagesSlice.actions.removeChatMessages;
export const removeStarredMessages = messagesSlice.actions.removeStarredMessages;
export default messagesSlice.reducer;