<script>
import Spinner from "@components/spinner";
import ChangePassword from "@views/vendor-management/vendor-profile/components/change-password";
import { mapGetters } from "vuex";

export default {
    name: "app",
    components: {
        Spinner,
        ChangePassword,
    },
    data() {
        return {
            loggedInUser: this.$store.getters["account/getUser"],
        };
    },
    // mounted() {
    //     this.$Progress.finish();
    // },
    // created() {
    //     console.log("Environment", process.env.VUE_APP_NODE_ENV);
    //     this.$Progress.start();

    //     this.$router.beforeEach((to, from, next) => {
    //         this.$Progress.start();
    //         next();
    //     });

    //     this.$router.afterEach((to, from) => {
    //         this.$Progress.finish();
    //     });
    // },
    methods: {
        isLoading() {
            return this.$store.getters["loader/getLoader"];
        },
        async updatePassword(data) {
            if (data.newPassword == data.confirmPassword) {
                try {
                    await Promise.all([
                        this.$http.patch("user/change-password", data),
                        this.$http.updateById("user", this.loggedInUser.id, {
                            tempPassword: null,
                        }),
                    ]);

                    this.$utility.showSucessMessage("Password successfully changed");
                    this.$refs.changePassword.close();
                    this.$refs.document_requirement.open();
                } catch (err) {
                    this.$utility.showErrorMessage(err.message);
                }
            } else {
                this.$utility.showErrorMessage("Password does not match");
            }
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor"]),
    },
};
</script>

<template lang="pug">
#app
    //- spinner(
    //-     :show="isLoading()"
    //- )
    vue-progress-bar
    router-view(:key="$route.fullPath")
</template>

<style lang="scss">
@import "@design/common.scss";
</style>
