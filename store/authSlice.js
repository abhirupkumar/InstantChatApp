import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: null,
        userData: null,
        didTryAutoLogin: false,
    },
    reducers: {
        authenticate: (state, action) => {
            const { payload } = action
            state.token = payload.token;
            state.userData = payload.userData;
            state.didTryAutoLogin = true;
        },
        setDidTryAutoLogin: (state) => {
            state.didTryAutoLogin = true;
        },
        logout: (state) => {
            state.token = null;
            state.userData = null;
            didTryAutoLogin = false;
        },
        updateLoggedInData: (state, action) => {
            state.userData = ({ ...state.userData, ...action.payload })
        }
    }
})

export const authenticate = authSlice.actions.authenticate;
export const setDidTryAutoLogin = authSlice.actions.setDidTryAutoLogin;
export const updateLoggedInData = authSlice.actions.updateLoggedInData;
export const logout = authSlice.actions.logout;
export default authSlice.reducer;