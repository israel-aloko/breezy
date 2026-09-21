import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
    },
    reducers: {
        setNotifications(state, action) {
            state.items = action.payload;
        },
        addNotification(state, action) {
            //avoid duplicates if the socket event and a manual refetch race 
            const exists = state.items.some(n => n._id === action.payload._id);
            if (!exists) {
                state.items.unshift(action.payload);
            }
        },
        markOneRead(state, action) {
            const notification = state.items.find(n => n._id === action.payload);
            if (notification) notification.read = true;
        },
        markAllRead(state) {
            state.items.forEach(n => { n.read = true; });
        },
        clearNotifications(state) {
            state.items = [];
        },
    },
});

export const { setNotifications, addNotification, markOneRead, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;