<script>
export default {
    name: "VerifyPhone",
    props: {
        otp: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        showImage: {
            type: Boolean,
            default: false,
        }
        // showRegister: {
        //     type: Boolean,
        //     default: true,
        // },
    },
    methods: {
        async sendOtp() {
            try {
                await this.$utility.sendOtp(this.phone);
                this.$utility.showSucessMessage("OTP sent successfully!");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async verifyOtp() {
            try {
                await this.$utility.verifyOtp(this.phone, this.otp);
                this.$utility.showSucessMessage("OTP verified successfully.");
                this.$emit("action");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        back() {
            this.$emit("goback");
        },
    },
};
</script>
<template lang="pug">
form.login-main.OTP-reg(@submit.prevent="verifyOtp()")
    .text-center.pb-4(v-if="showImage")    
        img(src="@assets/images/logo.png")
    .form-group
        form-field-input(
            v-model="otp",
            attribute="OTP",
            input-type="text-number",
            placeholder="OTP ",
            :required="true",
            :maxLength="4"
        )
    .form-group.no-margin.login-section
        button.btn.green-button.btn-block.btn-cust-padd(:disabled="!otp || otp.length != 4")  Verify OTP
    .form-group.no-margin.login-section.mt-2
        | Did not get the OTP?
        span.link(@click="sendOtp()")  Resend
    .link.back-link.pull-right(@click="back()") back
</template>

<style lang="scss">
::-webkit-input-placeholder {
    color: gray !important;
}
::-moz-placeholder {
    color: gray !important;
}
:-ms-input-placeholder {
    color: gray !important;
}
:-moz-placeholder {
    color: gray !important;
}
.form-group {
    color: white;
}
.link.back-link:before {
    content: "\f177";
    color: #fff;
    position: absolute;
    right: 65px;
    font-family: FontAwesome;
}

</style>
