import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@state/store';
import routes from './routes';
// import app from '../main';

Vue.use(VueRouter);

export const router = new VueRouter({
    routes,
    mode: 'history',
});

router.beforeEach((to, from, next) => {
    const user = store.getters['account/getUser'];

    // store.dispatch('loader/updateLoader', true);
    // app.$Progress.start();
    
    if (to.matched.some(m => m.meta.admin) && (!store.state.auth.authenticated)) {
        next({
            name: 'login',
        });
    } else if (to.matched.some(m => m.meta.auth) && !store.state.auth.authenticated) {
        next({
            name: 'login',
        });
    } else if (to.matched.some(m => m.meta.guest) && store.state.auth.authenticated) {
        let name = "vendor.list";

        if (user.userType === "vendor" || (user.role && user.role === 'vendor')) {
            name = 'vendor.profile';
        }else if(user.role === "sourcing"){
            name = 'vendor.list';
        }
        next({
            name,
        });
    } else {
        next();
    }
    
    if(to.name === 'vendor.ledger') {
        if(user.vendor.showLedger) {
            next();
        } else {
            next({name: 'vendor.profile'})
        }
    } 
});

router.afterEach(() => {
    // app.$Progress.finish();
    // store.dispatch('loader/updateLoader', false);
});

Vue.router = router;

export default router;
