<script>
import FormLayout from "@layouts/form-layout";

export default {
    name: "Login",
    components: {
        FormLayout,
    },
    data() {
        return {
            user: {
                userName: null,
                password: null,
            },
        };
    },
    methods: {
        async login() {
            this.$Progress.start();
            const loginUser = {};
            loginUser.userName = this.user.userName.trim();
            loginUser.password = this.user.password;
            try {
                const result = await this.$http.postWithoutHeaders("login", loginUser);
                this.$store.dispatch("auth/login", result.object);
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
            this.$Progress.finish();
        },
    },
};
</script>

<template lang="pug">
form-layout
    template(slot='title') Login
    template(slot='body')
        div.login-main.mt-3
            form(@submit.prevent='login()')
                .form-group
                    //- label.text-black(for='userName') Username / mobile number
                    form-field-input(
                        v-model="user.userName",
                        attribute="Username",
                        input-type="text",
                        placeholder="Username / mobile number",
                        :required="true",
                    )
                .form-group
                    //- label.text-black(for='password') Password
                    .c-form-row
                        form-field-input(
                            v-model="user.password",
                            attribute="Password",
                            :input-type="'password'",
                            placeholder='Password',
                            :required="true",
                            :maxLength="50",
                        )
                        //- span.fa.fa-eye.field-icon.toggle-password.cursor-pointer(@click="passwordToggle()")        
                .no-margin.login-section.mt-4
                    button.btn-block.login-button.btn-cust-padd
                        span Login
                div.text-center.mt-2
                    link-inline.bbq-forget-password(
                        :route="'forgot-password'",
                        label='Forgot Password?'
                    )
</template>

<style lang="scss">
</style>
