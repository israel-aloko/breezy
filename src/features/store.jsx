import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authSlice'
import notificationsReducer from './reducers/notificationSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationsReducer,
    },
})
