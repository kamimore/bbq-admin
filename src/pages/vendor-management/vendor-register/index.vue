<script>
import FormLayout from "@layouts/form-layout";
import Register from "./components/register";
import CreatePassword from "./components//create-password";
import VerifyPhone from "@components/verify-phone";

export default {
    name: "VendorRegister",
    components: {
        FormLayout,
        Register,
        VerifyPhone,
        CreatePassword,
    },
    data() {
        return {
            user: {
                companyName: null,
                password: null,
                email: null,
                phone: null,
                fullName: null,
            },
            confirmPassword: null,
            selected: false,
            error: null,
            otp: "",
            showRegister: true,
            changePassword: false,
            token: null
        };
    },
    methods: {
        goback() {
            this.showRegister = true;
        },
        async register() {
            try {
                const result = await this.$http.postWithoutHeaders("register/vendor", this.user);
                this.$utility.showSucessMessage(result.object.message);
                this.changePassword = true;
                this.token = result.object.token;
                // this.$router.push({ name: "login" });
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async sendOtp() {
            try {
                const result = await this.$http.postWithoutHeaders("check-unique-user", {
                    email: this.user.email,
                    phone: this.user.phone,
                });

                if (result.error) {
                    this.$utility.showErrorMessage(result.object.message);
                } else {
                    this.showRegister = false;
                    await this.$utility.sendOtp(this.user.phone);
                    this.$utility.showSucessMessage("OTP has been sent successfully");
                }
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },

        async createPassword(data) {
            try {
                const result = await this.$http.postWithoutHeaders("user/create-password", {
                    phone: this.user.phone,
                    password: data,
                    token: this.token
                });

                this.$utility.showSucessMessage("Password successfully created!");
                localStorage.setItem("first-time-login", result.object.firstTimeUser);
                this.$store.dispatch("auth/login", result.object);
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
    },
};
</script>

<template lang="pug">
form-layout.register(:class="{ 'v-otp-password' : (!showRegister && !changePassword) || changePassword}")
    template(slot='title')
        | Register
    template(slot='body')
        register(
            v-if="showRegister && !changePassword"
            :user="user",
            :selected="selected",
            @action="sendOtp",
        )
        verify-phone(
            v-if="!showRegister && !changePassword",
            :otp="otp",
            :phone="user.phone",
            @action="register",
            @goback="goback",
            :showImage="true"
        )
        create-password(
            v-if="changePassword",
            @createPassword="createPassword",
            :showImage="true"
        )
</template>
