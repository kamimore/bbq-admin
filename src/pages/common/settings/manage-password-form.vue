<script>
export default {
    name: "ManagePasswordForm",
    components: {},
    data() {
        return {
            data: {
                oldPassword: null,
                newPassword: null,
                confirmPassword: null,
                passwordType: "password",
            },
        };
    },
    methods: {
        action() {
            this.$emit("updatePassword", this.data);
        },
        passwordToggle() {
            this.passwordType = this.passwordType === "password" ? "text" : "password";
        },
    },
};
</script>

<template lang="pug">
form.row(@submit.prevent='action()')
    .col-md-4
        form-field.password-v(
            v-model='data.oldPassword',
            attribute='Old password',
            input-type='password',
            :required='true',
            placeholder='Old Password',
            :maxLength="50",
        )
    .col-md-4
        form-field.password-v(
            v-model='data.newPassword',
            attribute='New password',
            input-type='password',
            :required='true',
            placeholder='New password',
            :maxLength="50",
        )
    .col-md-4
        form-field.password-v(
            v-model='data.confirmPassword',
            attribute='Confirm password',
            input-type='password',
            :required='true',
            placeholder='Confirm password',
            :maxLength="50",
        )
    .text-right.col-md-12
        button.btn.btn-primary.bbq-btn-primary Update
</template>