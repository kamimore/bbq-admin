<script>
import DLayout from "@layouts/default-layout";
import ManagePasswordForm from "./manage-password-form";
import ManagePhoneForm from "./manage-phone-form";

export default {
    name: "Settings",
    components: {
        DLayout,
        ManagePasswordForm,
        ManagePhoneForm,
    },
    data() {
        const menuList = [
            {
                title: "Manage Password",
                component: "manage-password-form",
            },
            {
                title: "Manage Phone",
                component: "manage-phone-form",
            },
        ];
        return {
            user: null,
            currentView: "manage-password-form",
            message: "",
            isError: false,
            menuList,
        };
    },
    async created() {
        this.user = this.$store.getters["account/getUser"];
    },
    methods: {
        async updatePassword(data) {
            if (data.newPassword == data.confirmPassword) {
                try {
                    await this.$http.patch("user/change-password", data);
                    this.$utility.showSucessMessage("Password successfully changed");
                    this.$router.push({ name: "vendor.profile" });
                } catch (err) {
                    this.$utility.showErrorMessage(err.message);
                }
            } else {
                this.$utility.showErrorMessage("Password does not match");
            }
        },
        changeCurrentView(name) {
            this.currentView = name;
            this.message = "";
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        .row
            .col-sm-12.mana-pass
                b-tabs(card)
                    b-tab(
                        v-for="menu in menuList",
                        :key="menu.component",
                        :class="currentView === menu.component ? 'active': ''",
                        @click="changeCurrentView(menu.component)",
                        :title="menu.title | humanize  ",
                    )
                        component(
                            :is="currentView",
                            @updatePassword="updatePassword"
                        )
</template>

<style lang="scss">
</style>

