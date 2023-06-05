<script>
import FormLayout from "@layouts/form-layout";
export default {
    name: "CreatePassword",
    props: {
        showImage: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        FormLayout,
    },
    data() {
        return {
            newPassword: "",
            confirmPassword: "",
        };
    },
    methods: {
        createPassword() {
            try {
                if (this.newPassword !== this.confirmPassword) return this.$utility.showErrorMessage("Password does not matched");
                this.$emit("createPassword", this.newPassword);
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
};
</script>

<template lang="pug">
    form.login-main.OTP-reg(@submit.prevent='createPassword()')
        .text-center.pb-4(v-if="showImage")    
            img(src="@assets/images/logo.png")
        h4.password-update.text-center.text-success  Your OTP is verified.
        h4.password-update.text-center.text-success.pb-1  Create your new password
        .form-group
            .c-form-row
                form-field-input(
                    v-model="newPassword",
                    attribute="password",
                    :input-type="'password'",
                    placeholder='New Password',
                    :required="true",
                    :maxLength="50",
                )
        .form-group
            .c-form-row
                form-field-input(
                    v-model="confirmPassword",
                    attribute="password",
                    :input-type="'password'",
                    placeholder='Confirm Password',
                    :required="true",
                    :maxLength="50",
                )
        .form-group.no-margin
            button.btn.green-button.btn-block.btn-cust-padd Create Password
</template>

<style lang="scss">
.password-update {
    font-weight: 400;
}
.password-update:first-child {
    margin: 0;
}
</style>
