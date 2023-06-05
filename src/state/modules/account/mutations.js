/* ============
 * Mutations for the account module
 * ============
 *
 * The mutations that are available on the
 * account module.
 */

import {
    FIND,
    SAVE,
    REMOVE,
    UPDATE,
    SAVE_ADMIN,
} from './mutation-types';
import Vue from 'vue';

export default {
    [FIND](state, user) {
        state.email = user.email;
        state.fullName = user.fullName;
        // state.lastName = user.lastName;
    },
    [SAVE](state, user) {
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    [SAVE_ADMIN](state, admin) {
        state.admin = admin;
        localStorage.setItem('admin', JSON.stringify(admin));
    },
    [REMOVE](state) {
        state.user = {};
        localStorage.removeItem('user');
        state.admin = {};
        localStorage.removeItem('admin');
    },
    [UPDATE](state, user) {
        Object.keys(user).forEach((k) => {
            Vue.set(state.user, k, user[k]);
        });
        localStorage.setItem('user', JSON.stringify(state.user));
    },
};
