import Vue from 'vue'
import App from './App.vue'
import router from '@router';
import store from '@state/store';
// import '@components/_globals';
import '@services/index';
import '@src/plugins/index';
import '@filters/index';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueApexCharts from 'vue-apexcharts'

store.dispatch('auth/check');
Vue.component('apexchart', VueApexCharts)
Vue.config.productionTip = process.env.NODE_ENV === 'production';

export default new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')
