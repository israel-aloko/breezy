import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API = import.meta.env.VITE_API_BASE_URL

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API}/api/users/me`, { credentials: 'include' })
            if (res.status === 401) return rejectWithValue('unauthenticated')
            if (!res.ok) return rejectWithValue('error')
            const data = await res.json()
            return data.user
        } catch {
            return rejectWithValue('network')
        }
    }
)
const initialState = {
    userId: null,
    fullname: null,
    role: null,
    email: null,
    profilePicture: null,
    jobTitle: '',
    bio: '',
    timezone: 'UTC',
    isAuthenticated: false,
    authChecked: false,
    provider: 'local',
}


// const authSlice = createSlice({
//     name: 'auth',
//     initialState: {
//         userId: null,
//         fullname: null,
//         role: null,
//         isAuthenticated: false,
//         authChecked: false, //addition
//     },
//     reducers: {
//         setUser(state, action) {
//             state.userId = action.payload.userId
//             state.fullname = action.payload.fullname
//             state.role = action.payload.role
//             state.isAuthenticated = true
//         },
//         logout(state) {
//             state.userId = null
//             state.fullname = null
//             state.role = null
//             state.isAuthenticated = false
//         }
//     }
// })


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.userId = action.payload.userId
            state.fullname = action.payload.fullname
            state.role = action.payload.role
            state.isAuthenticated = true
        },
        // used by the profile page after an edit so the sidebar updates instantly
        userUpdated(state, action) {
            Object.assign(state, action.payload)
        },
        logout() {
            // keep authChecked true, or route guards would show "Loading..." forever
            return { ...initialState, authChecked: true }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                const u = action.payload
                state.userId = u._id
                state.fullname = u.fullname
                state.role = u.role
                state.email = u.email
                state.profilePicture = u.profilePicture
                state.jobTitle = u.jobTitle
                state.bio = u.bio
                state.timezone = u.timezone
                state.isAuthenticated = true
                state.authChecked = true
                state.provider = u.provider
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                if (action.payload === 'unauthenticated') {
                    return { ...initialState, authChecked: true }
                }
                state.authChecked = true
            })
    },
})
export const { setUser, userUpdated, logout } = authSlice.actions
export default authSlice.reducer