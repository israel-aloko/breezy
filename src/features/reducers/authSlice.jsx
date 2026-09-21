import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userId: null,
        fullname: null,
        role: null,
        isAuthenticated: false,
        authChecked: false, //addition
    },
    reducers: {
        setUser(state, action) {
            state.userId = action.payload.userId
            state.fullname = action.payload.fullname
            state.role = action.payload.role
            state.isAuthenticated = true
        },
        logout(state) {
            state.userId = null
            state.fullname = null
            state.role = null
            state.isAuthenticated = false
        }
    }
})

export const { setUser, logout } = authSlice.actions
export default authSlice.reducer