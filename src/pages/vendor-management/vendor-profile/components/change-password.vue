<script>
export default {
    name: "ChangePassword",
    components: {},
    data() {
        return {
            data: {
                oldPassword: null,
                newPassword: null,
                confirmPassword: null,
            },
        };
    },
    methods: {
        action() {
            this.$emit("updatePassword", this.data);
        },
    },
};
</script>

<template lang="pug">
div
    .title-style-1.text-barbique.custom-arrow-add-AV Change Password
    form.row(@submit.prevent='action()')
        .col-md-12
            form-field.password-v(
                v-model='data.oldPassword',
                attribute='Old password',
                input-type='password',
                :required='true',
                placeholder='Old Password'
            )
        .col-md-12
            form-field.password-v(
                v-model='data.newPassword',
                attribute='New password',
                input-type='password',
                :validation="{required: true, min:4}",
                :required='true',
                placeholder='New password'
            )
        .col-md-12
            form-field.password-v(
                v-model='data.confirmPassword',
                attribute='Confirm password',
                input-type='password',
                :validation="{required: true, min:6}",
                :required='true',
                placeholder='Confirm password'
            )
        .text-right.col-md-12
            button.btn.btn-primary.bbq-btn-primary Submit
</template>