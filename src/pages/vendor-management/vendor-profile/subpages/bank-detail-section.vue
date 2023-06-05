<script>
import UploadedFilesList from "../components/uploaded-files-list";
import UploadDocument from "../components/upload-document";
import UploadVendorDocuments from "../components/upload-vendor-documents";
import { mapGetters } from "vuex";

export default {
    name: "BankDetailSection",
    components: {
        UploadedFilesList,
        UploadDocument,
        UploadVendorDocuments,
    },
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        banks: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
        locationIndex: {
            type: Number,
            default: 1,
        },
    },
    data() {
        const defaultBank = {
            VendorDocuments: [],
            bankName: null,
            accountNumber: null,
            confirmAccountNumber: null,
            accountHolderName: null,
            IFSCCode: null,
            isPrimary: false,
            isDeleted: false,
        };
        return {
            defaultBank,
        };
    },
    created() {
        if (this.banks && this.banks.length === 0) {
            this.banks.push(Object.assign({}, this.defaultBank));
        }
    },
    methods: {
        addBank() {
            if (this.banks && this.banks.length) {
                this.banks
                    .filter(b => !b.isDeleted)
                    .forEach(bank => {
                        const { isValid, message } = this.$utility.bankDetailValidation(bank);

                        if (!isValid) {
                            // this.$scrollTo('#bank-detail');
                            return this.$utility.showErrorMessage(message);
                        }

                        this.banks.push(Object.assign({}, this.defaultBank));
                    });
            }
        },

        removeBank(num) {
            this.$confirm("Are you sure you want to delete?", "Delete Bank", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                if (this.banks.length > 1) {
                    this.banks[num - 1].isDeleted = true;
                    // this.banks.splice(num - 1, 1);
                }
            });
        },

        saveDocument(index, data) {
            if (this.banks[index - 1] && this.banks[index - 1].VendorDocuments) {
                this.banks[index - 1].VendorDocuments.push(data);
            }
            this.$forceUpdate();
        },

        setDefault(isDefault, locationIndex) {
            this.vendor.VendorLocations.forEach((a, i) => {
                a.VendorBankDetails[0].isPrimary = false;
            });

            this.vendor.VendorLocations[locationIndex - 1].VendorBankDetails[0].isPrimary = isDefault;
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor"]),
        isDisabled() {
            return this.mode === "readOnly";
        },
        showConfirmAccNumber() {
            if (this.isInternalVendor) return true;
            return this.isVendor && !this.isDisabled;
        },
        isInternalVendor() {
            return this.vendor && this.vendor.type === "internal" && this.vendor.status === "draft";
        },
        // bankDetails() {
        //     return this.banks.filter(b => !b.isDeleted);
        // },
    },
};
</script>

<template lang="pug">
.grid-margin.stretch-card.bank-det
    .bank-detailss(
        v-for="index in banks.length",
        v-if="banks[index-1].isDeleted === false",
        :key="`bank_${index}`"
    )
        i.fa.fa-times.locat.cursor-pointer(
            v-if="index!== 1 && mode === 'add'", 
            aria-hidden="true", 
            @click="removeBank(index)"
        )
        .card-body.bank-detail-1
            .pull-right.set-default.locat
                label.switch
                    input(type="checkbox", v-model="banks[index-1].isPrimary", :disabled="isDisabled", @change="setDefault(banks[index-1].isPrimary, locationIndex)")
                    span.slider.round
            h5.card-title.font-weight-bold Bank Details
            div.clearfix
            form.forms-sample
                .row
                    .col-md-4.mb-2
                        form-field(
                            v-model="banks[index-1].accountHolderName",
                            attribute="Account Holder Name",
                            input-type="text",
                            :required="true",
                            placeholder="Account Holder Name",
                            :disabled="isDisabled",
                            :maxLength="50",
                        )
                    .col-md-4.mb-2
                        form-field(
                            v-model="banks[index-1].bankName",
                            attribute="Bank Name",
                            input-type="text",
                            :required="true",
                            placeholder="Bank Name",
                            :disabled="isDisabled",
                            :maxLength="50",
                        )
                    .col-md-4.mb-2
                        form-field(
                            v-model="banks[index-1].branchName",
                            attribute="Branch Name",
                            input-type="text",
                            :required="true",
                            placeholder="Branch Name",
                            :disabled="isDisabled",
                            :maxLength="20",
                        )
                .row
                    .col-md-4.b-d
                        form-field(
                            v-model="banks[index-1].accountNumber",
                            attribute="Account Number",
                            input-type="alpha-number",
                            :required="true",
                            placeholder="Account Number",
                            :maxLength="20",
                            :disabled="isDisabled"
                        )
                    .col-md-4.b-d(v-if="showConfirmAccNumber")
                        form-field(
                            v-model="banks[index-1].confirmAccountNumber",
                            attribute="Re-Enter Account Number",
                            input-type="alpha-number",
                            :required="true",
                            placeholder="Re-Enter Account Number",
                            :maxLength="20",
                            :disabled="isDisabled",
                            :disablePaste="true",
                        )
                    .col-md-4.b-d
                        form-field(
                            v-model="banks[index-1].IFSCCode",
                            attribute="IFSC Code",
                            v-b-tooltip.hover, 
                            title="IFSC code should be 11 charater long",
                            input-type="text",
                            :required="true",
                            placeholder="IFSC Code",
                            :maxLength="11",
                            :disabled="isDisabled"
                        )
        //.container.text-center.pb-2
            button.btn.btn-primary.btn-lg.bbq-btn-primary.mr-2(
                v-if="mode === 'add'",
                type="button", 
                @click="addBank()"
            )
                i.fa.fa-plus(aria-hidden="true")
                | Add Another Bank Details
</template>
