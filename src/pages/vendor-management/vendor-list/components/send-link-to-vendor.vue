<script>
export default {
    name: "SendLinkToVendor",
    data() {
        return {
            importedVendors: [],
            selectedVendor: null,
            phone: null,
            email: null,
            loggedInUser: this.$store.getters["account/getUser"],
        };
    },
    created() {
        this.getVendors();
    },
    methods: {
        async getVendors() {
            const query = {
                where: {
                    type: "imported",
                },
                attributes: ["id", "bbqVendorId", "type", "status", "showLedger", "companyName"],
                order: [["bbqVendorId", "asc"]],
                include: [
                    {
                        model: "User",
                        attributes: ["id", "email", "phone"],
                    },
                ],
            };

            this.importedVendors = await this.$http.get("vendor", query);
        },
        async submit() {
            try {
                if (this.phone && this.phone.length != 10) {
                    return this.$utility.showErrorMessage("Phone number should be 10 character long");
                }

                if (this.email && !this.$utility.validateEmail(this.email)) {
                    return this.$utility.showErrorMessage("Email is invalid");
                }

                await this.$http.rawPost("vendor/send-login-link", {
                    vendor: this.selectedVendor,
                    phone: this.phone,
                    email: this.email,
                });

                this.$utility.showSucessMessage("Login link has been sent to vendor");

                this.selectedVendor = null;
                this.phone = null;
                this.email = null;

                this.$emit("close");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        customLabel({ companyName, bbqVendorId }) {
            if (!companyName && !bbqVendorId) {
                return "Search Vendor";
            }
            return `${bbqVendorId} - ${companyName}`;
        },
        selectData(vendor) {
            this.phone = vendor && vendor.User ? vendor.User.phone : null;
            this.email = vendor && vendor.User ? vendor.User.email : null;
        },
    },
};
</script>

<template lang="pug">
.row
    .col-sm-12
        form(@submit.prevent="submit()")
            .title-style-1.text-barbique.custom-arrow-add-AV Send Link
            form-field(
                v-model="selectedVendor"
                attribute="Vendor",
                input-type="search-select",
                :items="importedVendors",
                trackBy='id',
                :required="true",
                openDirection="bottom",
                placeholder="Search Vendor",
                :custom-label="customLabel",
                @input="selectData"
            )
            form-field(
                v-model="phone",
                attribute="phone",
                input-type="text-number",
                placeholder='Phone',
                :required="true",
                :maxLength="10",
                :disabled="!selectedVendor"
            )
            form-field(
                v-model="email",
                attribute="Email",
                input-type="email",
                placeholder='Email',
                :required="false",
                :disabled="!selectedVendor"
            )    
            .form-group.no-margin.login-section
                button.btn.bbq-btn-primary.btn-block.btn-cust-padd(type="submit", :disabled="!selectedVendor || !phone")  Submit
</template>

<style lang="scss">
</style>