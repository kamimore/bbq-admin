/* ============
 * Actions for the auth module
 * ============
 *
 * The actions that are available on the
 * auth module.
 */

import Vue from 'vue';
import store from '@state/store';
import * as types from './mutation-types';

export const check = ({
    commit
}) => {
    commit(types.CHECK);
};

/* eslint-disable no-unused-vars */
export const register = ({
    commit
}) => {
    Vue.router.push({
        name: 'login',
    });
};

export const saveNotifications = ({
    commit
}, data) => {
    commit(types.SAVE_NOTIFICATION, data);
};

export const fetchUserNotifications = ({
    commit
}, data) => {
    commit(types.FETCH_USER_NOTIFICATIONS, data);
};
export const userNotificationReaded =({
    commit
}, data) => {
    commit(types.USER_NOTIFICATION_READED, data);
};

export const login = ({
    commit
}, data) => {
    commit(types.LOGIN, data.token);

    store.dispatch('account/save', data.user);
    store.dispatch('auth/fetchUserNotifications', { userId: data.user.id });

    let name = 'bd.survey.list';

    if (data.user.userType === "vendor") {
        name = 'vendor.profile';
    } else if(data.user.role === "superadmin"){
        name = 'vendor.list';
    } else {
        const initialRoute = data.user.permission[0];
        name = initialRoute;
    }

    // Vue.root.$emit('changePasswordModle')

    Vue.router.push({
        name,
    });
};

export const logout = ({
    commit
}) => {
    commit(types.LOGOUT);

    store.dispatch('account/remove');

    Vue.router.push({
        name: 'login',
    });
};

export default {
    check,
    register,
    login,
    logout,
    fetchUserNotifications,
    saveNotifications,
    userNotificationReaded
};
