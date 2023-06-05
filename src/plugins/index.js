import Vue from 'vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'element-ui/lib/theme-chalk/index.css';
import 'vuetify/src/stylus/app.styl';

/** Import packages */
import VueProgressBar from 'vue-progressbar';
import {
    router
} from '@router/index';
import Vuex from 'vuex';
import Vuetify from 'vuetify/lib';
import ElementUI from 'element-ui';
import ElementUILang from 'element-ui/lib/locale/lang/en';
import ElementUILocale from 'element-ui/lib/locale';
import SweetModal from 'sweet-modal-vue/src/plugin';
import VeeValidate from 'vee-validate';
import VuexRouterSync from 'vuex-router-sync';
import store from '@state/store.js';
import VueScrollTo from 'vue-scrollto';
import BootstrapVue from 'bootstrap-vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import VueHtmlToPaper from 'vue-html-to-paper';
import DownloadCsv from "vue-json-csv";
import VueExcel from 'vue-excel-export'

Vue.use(VueProgressBar, {
    color: 'rgb(88, 90, 90)',
    failedColor: 'red',
    height: '2px',
    thickness: '3px'
});

// configure language
ElementUILocale.use(ElementUILang);

// Change the field bag name of vee validate because it conflicts with element ui forms
const VeeValidateConfig = {
    fieldsBagName: 'veeValidateFields',
    inject: false,
};

Vue.use(VueHtmlToPaper, {
    name: '_blank',
    specs: [
        'fullscreen=yes',
        'titlebar=yes',
        'scrollbars=yes'
    ],
    styles: [
        'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
        'https://unpkg.com/kidlat-css/css/kidlat.css',
    ]
});

Vue.use(SweetModal);
Vue.use(VeeValidate, VeeValidateConfig);
Vue.use(ElementUI);
Vue.use(VueExcel)
Vue.use(Vuetify, {
    iconfont: 'md',
});
Vue.use(Vuex);
VuexRouterSync.sync(store, router);

// Inview.offset(-400);
Vue.use(BootstrapVue);
Vue.use(VueScrollTo, {
    container: 'body',
    duration: 500,
    easing: 'ease',
    offset: 0,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true,
});

Vue.component('downloadCsv', DownloadCsv)

if (process.env.VUE_APP_NODE_ENV === 'staging' || process.env.VUE_APP_NODE_ENV === 'production') {
    Raven
    .config(process.env.VUE_APP_SENTRY_DSN, {
        environment: process.env.NODE_ENV,
        autoBreadcrumbs: true,
    })
    .addPlugin(RavenVue, Vue)
    .install();
}

// global components
import FormFieldInput from '@components/form-field-input';
import FormField from '@components/form-field';
import FormHelp from '@components/form-help';
import LinkInline from '@components/link-inline';
import AlertMessage from '@components/alert-message';
import Tag from '@components/tag';
import StatusColor from '@components/status-color';
import TruncateTooltip from '@components/truncate-tooltip';

Vue.component('form-field-input', FormFieldInput);
Vue.component('form-field', FormField);
Vue.component('form-help', FormHelp);
Vue.component('link-inline', LinkInline);
Vue.component('alert-message', AlertMessage);
Vue.component('tag', Tag);
Vue.component('status-color', StatusColor);
Vue.component('truncate-tooltip', TruncateTooltip);
