<script>
import FormLayout from "@layouts/form-layout";

export default {
    name: "ResetPassword",
    components: {
        FormLayout,
    },
    data() {
        return {
            passwordConfirm: null,
            password: null,
        };
    },
    methods: {
        async changePassword() {
            try {
                this.message = "";
                this.isError = false;
                const token = this.$route.params.token;
                if (token && this.password === this.passwordConfirm) {
                    const body = {
                        token,
                        newPassword: this.password,
                    };
                    const result = await this.$http.rawPut("reset-password", body);
                    this.$utility.showSucessMessage("Password successfully updated");
                    this.$utility.goToPage("login");
                } else {
                    this.$utility.showErrorMessage("Password doesn't match");
                }
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
};
</script>

<template lang="pug">
form-layout
    template(slot='title') Change Password
    template(slot='body')
        form.login-main.reset-password(@submit.prevent='changePassword()')
            .form-group
                //- label.text-white(for='password') Password
                .c-form-row
                   form-field-input(
                        v-model="password",
                        attribute="password",
                        input-type="password",
                        :required="true",
                        placeholder='Password',
                        :maxLength="50",
                    )
            .form-group
                //- label.text-white(for='password') Confirm Password
                .c-form-row
                   form-field-input(
                        v-model="passwordConfirm",
                        attribute="Confirm password",
                        input-type="password",
                        :required="true",
                        placeholder='Confirm password',
                        :maxLength="50",
                    )
            .form-group.no-margin
                button.btn.green-button.btn-block.btn-cust-padd(type='submit') Update
            .margin-top20.text-center
                link-inline.text-theme(:route="'login'", label='Sign in')
</template>

<style lang="scss">
</style>
