<script>
export default {
    name: "AddVendor",
    data() {
        return {
            user: {
                companyName: null,
                password: null,
                email: null,
                phone: null,
                fullName: null,
            },
            phone: null,
            otp: null,
            step: 1,
            loggedInUser: this.$store.getters["account/getUser"],
        };
    },
    methods: {
        async register() {
            try {
                Object.assign(this.user, {
                    type: "internal",
                    registeredById: this.loggedInUser.id,
                });

                const result = await this.$http.postWithoutHeaders("register/vendor", this.user);

                const vendorId = result.object && result.object.vendor ? result.object.vendor.id : null;

                this.$utility.showSucessMessage("Vendor registered successfully");

                this.$utility.goToPage("vendor.view", {
                    id: vendorId,
                });
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async checkUniqUser() {
            try {
                const result = await this.$http.postWithoutHeaders("check-unique-user", {
                    email: this.user.email,
                    phone: this.user.phone,
                });

                if (result.error) {
                    this.$utility.showErrorMessage(result.object.message);
                } else {
                    await this.sendOtp();
                    this.next();
                }
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async sendOtp() {
            await this.$utility.sendOtp(this.user.phone);
            this.$utility.showSucessMessage("OTP sent successfully!");
        },
        async verifyOtp() {
            try {
                await this.$utility.verifyOtp(this.user.phone, this.otp);
                this.$utility.showSucessMessage("OTP verified successfully.");
                await this.register();
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        next() {
            this.step++;
        },
        prev() {
            this.step--;
        },
    },
};
</script>

<template lang="pug">
.row
    .col-sm-12(v-if="step === 1")
        form(@submit.prevent="checkUniqUser()")
            .title-style-1.text-barbique.custom-arrow-add-AV Add Vendor
            .form-group
                form-field-input(
                    v-model="user.companyName",
                    attribute="Company Name",
                    input-type="text",
                    placeholder="Company Name",
                    :required="true",
                )
            .form-group
                form-field-input(
                    v-model="user.fullName",
                    attribute="Contact Person Name",
                    input-type="text",
                    placeholder='Contact Person Name',
                    :required="true",
                )
            .form-group
                form-field-input(
                    v-model="user.email",
                    attribute="Email",
                    input-type="email",
                    placeholder='Email',
                    :required="false",
                )    
            .form-group
                form-field-input(
                    v-model="user.phone",
                    attribute="phone",
                    input-type="text-number",
                    placeholder='Mobile Number',
                    :required="true",
                    :maxLength="10"
                )
            .form-group.no-margin.login-section
                button.btn.bbq-btn-primary.btn-block.btn-cust-padd(type="submit")  Register
    .col-sm-12.phone-popup(v-if="step === 2")
        i.fas.fa-angle-left.back-icon(@click="prev()")
        div.mt-3
            h4.text-center.font-weight-bold Please enter a One-Time-Password to verify your account
            //- h6.text-center Please type verification code sent to 
            //-     span.font-weight-bold {{phone}} 
            .text-center.Verification-code
                v-flex(sm6='')
                    form-field-input(
                        v-model="otp",
                        attribute="otp",
                        input-type="text-number",
                        placeholder='OTP',
                        :required="true",
                        :maxLength="4"
                    )
                     //-     v-text-field(v-model="otp", clearable='') 
            .col-sm-12.mt-3.text-center
                button.btn.btn-primary.bbq-btn-primary(@click="verifyOtp()", :disabled="!otp || otp.length != 4") Validate OTP
                p.mt-3.cursor-pointer.link(@click="sendOtp()") Didn't get OTP ? Resend
</template>

<style lang="scss">
.phone img {
    width: 50%;
}
.Verification-code .flex.sm6 {
    display: inline-block;
}
.back-icon {
    font-size: 30px;
    color: #1b5b36;
    cursor: pointer;
}
.A {
    display: none;
}
</style>