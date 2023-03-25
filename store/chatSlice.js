import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "users",
    initialState: {
        chatsData: {},
    },
    reducers: {
        setChatsData: (state, action) => {
            state.chatsData = { ...action.payload.chatsData };
        }
    }
})

export const setChatsData = chatSlice.actions.setChatsData;
export default chatSlice.reducer;