<script>
export default {
    name: "ManagePhoneForm",
    components: {},
    data() {
        return {
            phone: null,
            password: null,
            otp: null,
            showOTP: false,
        };
    },
    methods: {
        action() {
            this.$emit("updatePhone", this.phone);
        },
        async sendOtp() {
            try {
                await this.$http.rawPost("verify-password-send-otp", {
                    phone: this.phone,
                    password: this.password,
                });

                this.$utility.showSucessMessage("OTP sent successfully.");
                this.showOTP = true;
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
        async verifyOtpAndUpdate() {
            try {
                const success = await this.$http.rawPost("verify-otp-update-phone", {
                    phone: this.phone,
                    otp: this.otp,
                });

                this.$utility.showSucessMessage(success.message);
                this.showOTP = false;
                // this.$utility.goToPage("vendor.profile");
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
        // async verifyOtp() {
        //     try {
        //         await this.$utility.verifyOtp(this.phone, this.otp);
        //         this.$utility.showSucessMessage("OTP verified successfully.");
        //     } catch (err) {
        //         this.$utility.showErrorMessage(err.message);
        //     }
        // },
    },
};
</script>

<template lang="pug">
div
    .row
        .col-md-4(v-show="!showOTP")
            form-field(
                v-model='phone',
                attribute='New Phone Number',
                input-type='text-number',
                :required='true',
                placeholder='Enter your phone number',
                :maxLength="10",
                :minLength="10",
            )
        .col-md-4(v-show="!showOTP")
            form-field.password-v(
                v-model='password',
                attribute='Password',
                input-type='password',
                :required='true',
                placeholder='Enter your password',
                :maxLength="15",
            )
        .col-md-4(v-show="showOTP")
            form-field(
                v-model='otp',
                attribute='OTP',
                input-type='text-number',
                :required='true',
                placeholder='Enter otp',
                :maxLength="4"
            )
    .text-right.col-md-12
        button.btn.btn-primary.bbq-btn-primary(v-if="!showOTP", @click="sendOtp()", :disabled="!phone || !password") Send OTP
        button.btn.btn-primary.bbq-btn-primary(v-else @click="verifyOtpAndUpdate()", :disabled="!otp || otp.length != 4") Verify OTP and Update
</template>