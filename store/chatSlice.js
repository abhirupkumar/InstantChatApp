import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "users",
    initialState: {
        chatsData: {},
    },
    reducers: {
        setChatsData: (state, action) => {
            state.chatsData = { ...action.payload.chatsData };
        },
        removeChatsData: (state, action) => {
            state.chatsData = {};
        }
    }
})

export const setChatsData = chatSlice.actions.setChatsData;
export const removeChatsData = chatSlice.actions.removeChatsData;
export default chatSlice.reducer;