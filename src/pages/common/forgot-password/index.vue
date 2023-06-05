<script>
import FormLayout from "@layouts/form-layout";
import VerifyPhone from "@components/verify-phone";
export default {
    name: "ForgotPassword",
    components: {
        FormLayout,
        VerifyPhone,
    },
    data() {
        return {
            email: null,
            showForgotPassword: true,
            token: null,
        };
    },
    methods: {
        async changePassword() {
            try {
                this.message = "";
                this.isError = false;

                const result = await this.$http.postWithoutHeaders("forgot-password", {
                    email: this.email,
                });

                this.token = result.object.token;

                this.showForgotPassword = false;

                this.$utility.showSucessMessage("OTP has been sent successfully");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        resetPassword() {
            try {
                this.$utility.goToPage("reset-password", { token: this.token });
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
};
</script>

<template lang="pug">
form-layout
    template(slot='title') Forgot Password
    template(slot='body')
        form.login-main(v-if="showForgotPassword", @submit.prevent='changePassword()')
            .form-group
                form-field-input(
                    v-model="email",
                    attribute="Phone",
                    contextual-style="dark",
                    inputType="text-number",
                    :required="true",
                    placeholder="phone",
                    :maxLength="10",
                    :minLength="10",
                )
                .form-text.text-white By clicking "Reset Password" we will send an OTP to the registered mobile number
            .form-group.no-margin
                button.btn.green-button.btn-block.btn-cust-padd Reset Password
            .margin-top20.text-center
                link-inline.bbq-forget-password(:route="'login'", label='Sign in here.')
        verify-phone(
            v-else,
            :phone="email",
            @action="resetPassword",
            @goback="showForgotPassword = true",
        )
</template>

<style lang="scss"></style>
