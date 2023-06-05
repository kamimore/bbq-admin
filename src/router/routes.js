export default [
    //------------------------- Common pages------------------------------
    {
        path: '/login',
        name: 'login',
        component: () => import('@views/common/login/index'),
        meta: {
            guest: true,
        },
    },

    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('@views/common/forgot-password/index.vue'),
        meta: {
            guest: true,
        },
    },

    {
        path: '/reset-password/:token',
        name: 'reset-password',
        component: () => import('@views/common/reset-password/index.vue'),
        meta: {
            guest: true,
        },
    },

    {
        path: '/verify-email/:token',
        name: 'verify-email',
        component: () => import('@views/common/verify-email/index.vue'),
        meta: {
            guest: true,
        },
    },

    {
        path: '/notification',
        name: 'notification',
        component: () => import('@views/common/notifications/index.vue'),
        meta: {
            auth: true
        }
    },

    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@views/common/dashboard/index'),
        meta: {
            auth: true,
        },
    },

    {
        path: '/setting',
        name: 'setting',
        component: () => import('@views/common/settings/index'),
        meta: {
            auth: true,
        },
    },

    // --------------------------- Master Table pages ---------------------------------------

    {
        path: '/master/vendor-type',
        name: 'master.vendor_type.list',
        component: () => import('@views/master-table-management/vendor-type/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/master/payment-term',
        name: 'master.payment_term.list',
        component: () => import('@views/master-table-management/payment-term/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/master/delivery-term',
        name: 'master.delivery_term.list',
        component: () => import('@views/contract-management/delivery-period-management/index'),
        meta: {
            auth: true,
        },
    },
    {
        path: '/master/advance-payment',
        name: 'master.advance_payment.list',
        component: () => import('@views/contract-management/advance-payment-management/index'),
        meta: {
            auth: true,
        },
    },
    {
        path: '/master/template-category',
        name: 'master.template_category.list',
        component: () => import('@views/contract-management/template-category/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/master/template',
        name: 'master.template.list',
        component: () => import('@views/contract-management/template-management/index'),
        meta: {
            admin: true,
        },
    },

    // --------------------------- BD Management pages --------------------------------------

    {
        path: '/essense',
        name: 'bd',
        component: () => import('@views/bd-management/index'),
        meta: {
            admin: true,
        },
        children: [{
            path: 'question-category',
            name: 'bd.category.list',
            component: () => import('@views/bd-management/category-list/index'),
        }, {
            path: 'question',
            name: 'bd.question.list',
            component: () => import('@views/bd-management/question-list/index'),
        }, {
            path: 'manage-question',
            name: 'bd.question.manage',
            component: () => import('@views/bd-management/manage-question/index'),
        }, {
            path: 'project',
            name: 'bd.survey.list',
            component: () => import('@views/bd-management/survey-list/index'),
        }, {
            path: 'project/view/:id',
            name: 'bd.survey.view',
            component: () => import('@views/bd-management/view-survey/index'),
        }, {
            path: 'project-status',
            name: 'bd.survey.status.list',
            component: () => import('@views/bd-management/survey-status-list/index'),
        }]
    },

    // --------------------------- Contract Management pages --------------------------------------
    {
        path: '/contract/manage-contract',
        name: 'contract.create',
        component: () => import('@views/contract-management/manage-contract/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/contract/manage-contract/:id',
        name: 'contract.edit',
        component: () => import('@views/contract-management/manage-contract/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/contract/contract-history',
        name: 'contract.history',
        component: () => import('@views/contract-management/contract-history/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/contract/override-contract-history',
        name: 'override.contract.history',
        component: () => import('@views/contract-management/override-contract-history/index'),
        meta: {
            admin: true,
        },
    },
    {
        path: '/contract/view-contract/:id',
        name: 'contract.view',
        component: () => import('@views/contract-management/view-contract/index'),
        meta: {
            admin: true,
        },
    },


    // --------------------------- User Management pages --------------------------------------

    {
        path: '/user',
        name: 'user',
        component: () => import('@views/user-management/index'),
        meta: {
            admin: true,
        },
        children: [{
                path: 'manage-users',
                name: 'user.list',
                component: () => import('@views/user-management/user-list/index'),
            },
            {
                path: 'manage-role',
                name: 'role.list',
                component: () => import('@views/user-management/role-list/index'),
            }, {
                path: 'logs',
                name: 'logs.list',
                component: () => import('@views/user-management/logs-list/index'),
            }
        ],
    },

    //---------------------------------------- Vendor Management Pages ----------------------------------------------

    {
        path: '/vendor/ledger/:id',
        name: 'vendor.ledger.list',
        component: () => import('@views/vendor-management/vendor-ledger/index'),
        meta: {
            admin: true,
        },
    },

    {
        path: '/vendor/view/:id',
        name: 'vendor.view',
        component: () => import('@views/vendor-management/vendor-profile/index'),
        meta: {
            admin: true,
        },
    },

    {
        path: '/vendor/manage-vendor',
        name: 'vendor.list',
        component: () => import('@views/vendor-management/vendor-list/index'),
        meta: {
            admin: true,
        },
    },

    {
        path: '/vendor/register',
        name: 'vendor.register',
        component: () => import('@views/vendor-management/vendor-register/index'),
        meta: {
            guest: true,
        },
    },

    {
        path: '/vendor/profile',
        name: 'vendor.profile',
        component: () => import('@views/vendor-management/vendor-profile/index'),
        meta: {
            auth: true,
        },
    },

    {
        path: '/vendor/contract',
        name: 'vendor.contract',
        component: () => import('@views/contract-management/contract-history/index'),
        meta: {
            auth: true
        }
    },

    {
        path: '/vendor/contract/view-contract/:id',
        name: 'vendor.contract.view-contract',
        component: () => import('@views/contract-management/view-contract/index'),
        meta: {
            admin: true,
        },
    },

    {
        path: '/vendor/ledger',
        name: 'vendor.ledger',
        component: () => import('@views/vendor-management/vendor-ledger/index'),
        meta: {
            auth: true,
        },
    },

    // --------------------------- Default routing --------------------------------------

    {
        path: '/',
        redirect: '/login',
    }, {
        path: '/*',
        redirect: '/login',
    },
];
