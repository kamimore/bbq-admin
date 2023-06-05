<script>
export default {
    name: "Register",
    props: {
        user: {
            type: Object,
            default: () => {},
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
<template lang="pug">
form.login-main.register-form(@submit.prevent="$emit('action')")
    .row.reg-for-mobile 
        .col-sm-6.reg-image-mob
            .text-center    
                img.vendor-register-png(src="@assets/images/Vendor-Registration.png")
        .col-sm-6.d-flex.justify-content-center.reg-form-mob
            .register_form_1
                .text-center    
                    img(src="@assets/images/logo.png")
                .text-center.pt-4.reg-mob-h
                    h3.title-style-1.font-weight-300.pb-3.theme-text-color  Register with Barbeque Nation
                .form-group
                    form-field-input(
                        v-model="user.companyName",
                        attribute="Company Name",
                        input-type="text",
                        placeholder="Company Name",
                        :required="true",
                        :maxLength="50",
                    )
                .form-group
                    form-field-input(
                        v-model="user.fullName",
                        attribute="Contact Person Name",
                        input-type="text",
                        placeholder='Contact Person Name',
                        :required="true",
                        :maxLength="50",
                    )
                .form-group
                    form-field-input(
                        v-model="user.email",
                        attribute="Email",
                        input-type="email",
                        placeholder='Email',
                        :required="false",
                        :maxLength="50",
                    )    
                .form-group
                    form-field-input(
                        v-model="user.phone",
                        attribute="phone",
                        input-type="text-number",
                        placeholder='Mobile Number',
                        :required="true",
                        :maxLength="10",
                        :minLength="10",
                    )
                .form-group.checkbox-bbq
                    label   
                    form-field-input(
                        v-model="selected",
                        inputType="checkbox",
                        :required="true",
                    )
                    span.text-white  I agree to the 
                    a.link(href="https://www.barbequenation.com/privacy-policy/", target="_blank") Privacy Policy 
                    span.text-white and 
                    a.link(href="https://www.barbequenation.com/terms-and-condition/", target="_blank") Terms & Conditions
                    span.checkmark
                .form-group.no-margin.login-section
                    button.btn.green-button.btn-block.btn-cust-padd.button-font.font-weight-400(type="submit")  Join Us !
                .form-group.no-margin.login-section.mt-3
                    span.text-white Already have an account? 
                    link-inline(
                        :route="'login'",
                        label="Sign in"
                    )
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
.register-form .form-group {
    color: black;
}
</style>
