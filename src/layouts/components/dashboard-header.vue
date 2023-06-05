<script>
export default {
    name: "DashboardHeader",
    components: {},
    data() {
        return {
            toggle: false,
            user: null,
        };
    },
    created() {
        this.user = this.$store.getters["account/getUser"];
    },
    computed: {
        unReadNotification() {
            return this.$store.getters["auth/getUserNotification"].filter(a => a.hasRead === false).length;
        },
    },
    methods: {
        logout() {
            this.$store.dispatch("auth/logout");
        },
        redirectToPermissionPage() {
            let name = "bd.survey.list";

            if (this.user.userType === "vendor") {
                name = "vendor.profile";
            } else if (this.user.role === "superadmin") {
                name = "bd.survey.list";
            } else {
                const initialRoute = this.user.permission[0];
                name = initialRoute;
            }

            this.$utility.goToPage(name);
        },
    },
};
</script>

<template lang="pug">
header#main-nav
    .container
        .row
            .col-sm-8.headSideBar
                //- h4.text-left.mt-2.ml-3 Heading Will Come Here
                //- .c-logo.float-left   
                    //- //:route="`${user.role}.dashboard`",
                    //- link-inline(
                    //-     :route="'dashboard'",
                    //- )
                    //-     img(src="@assets/images/logo.png")
                .row
                    .bbq-logo-img
                        .c-logo.text-center.link
                            img.expand-sidebar(src="@assets/images/logo.png", @click="redirectToPermissionPage()")
                    .bbq-logo-img-collapsed
                        .c-logo.text-center.link
                            img.expand-sidebar1(src="@assets/images/favicon.png", @click="redirectToPermissionPage()")
                    .bbq-toggle-bar
                        span.sidebar-toggle.cursor-pointer(@click="$emit('toggleSideBar')")

                //- span.sidebar-toggle.cursor-pointer(@click="$emit('toggleSideBar')")
                    //- h4.head-ings.float-left Manage Contract

            .col-sm-4.headSideBar
               
                .c-header-right
                    nav
                        ul
                            li
                                link-inline(
                                    :route="'notification'",
                                    contextualStyle="notification-icon",
                                )
                                    i.fa.fa-bell-o
                                    span(v-if="unReadNotification !== 0") {{ unReadNotification}}
                            li
                                .short-details(@click="toggle=!toggle")
                                    .user-setting-icon
                                        span.avatar-icon.mr-2
                                            //- img(src="@assets/images/photo.png")
                                            i.fa.fa-user-circle-o
                                        span.user-name
                                            | {{user.fullName | capitalize}}
                                        i.fa.fa-angle-down
                                    .nav-dropdown(v-show="toggle")
                                        ul
                                            li(@click="logout()")
                                                a.text-black Logout
    



</template>

<style lang="scss">
@import "@design/common.scss";
@import "@design/component/_header.scss";
</style>
