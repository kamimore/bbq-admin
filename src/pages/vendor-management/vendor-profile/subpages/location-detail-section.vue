<script>
import BankDetailSection from "./bank-detail-section";
import UploadedFilesList from "../components/uploaded-files-list";
import UploadDocument from "../components/upload-document";
import UploadVendorDocuments from "../components/upload-vendor-documents";
import FileUpload from "@components/file-upload";
import { mapGetters } from "vuex";

export default {
    name: "LocationDetailSection",
    components: {
        BankDetailSection,
        UploadedFilesList,
        UploadDocument,
        FileUpload,
        UploadVendorDocuments,
    },
    inject: ["$validator"],
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        locations: {
            type: Array,
            default: () => [],
        },
        mstStates: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
        loggedInUser: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        const defaultLocation = {
            VendorDocuments: [],
            VendorBankDetails: [],
            contactPersonName: null,
            email: null,
            address: null,
            city: null,
            stateId: null,
            country: "India",
            postCode: null,
            landlineNumber: null,
            phoneNumber: null,
            fax: null,
            isPANAvailable: "false",
            panNumber: null,
            tinNumber: null,
            taxLiable: "false",
            taxLiableCode: null,
            gstVendorType: "not_registered",
            gstNumber: null,
            fssaiNumber: null,
            fssaiValidTill: null,
            isDeleted: false,
        };
        return {
            defaultLocation,
            showPanFile: false,
            showGST: false,
            showChq: false,
            toggleLocation: null,
            isFetching: false,
            selectedLocationIndex: 1,
        };
    },
    created() {
        if (this.locations && this.locations.length === 0) {
            if (this.vendor.status === "draft") {
                const user = this.vendor.User;

                if (!this.defaultLocation.contactPersonName)
                    this.defaultLocation.contactPersonName = user ? user.fullName : "";
                if (!this.defaultLocation.email) this.defaultLocation.email = user ? user.email : "";
                if (!this.defaultLocation.phoneNumber) this.defaultLocation.phoneNumber = user ? user.phone : "";
            }
            this.locations.push(Object.assign({}, this.defaultLocation));
        }
    },
    methods: {
        addLocation() {
            // if (this.locations && this.locations.length) {
            let isAllowed = true;
            this.locations
                .filter(l => !l.isDeleted)
                .forEach(loc => {
                    console.log("adding location in loop");
                    const { isValid, message, type } = this.$utility.vendorLocationDetailValidation(loc);

                    if (!isValid) {
                        if (type != "bank") this.$scrollTo("#location-detail");
                        isAllowed = false;
                        return this.$utility.showErrorMessage(message);
                    }
                });
            if (isAllowed) {
                this.locations.push(Object.assign({}, this.defaultLocation));
            }
            // }
        },
        removeFile(file, index) {
            console.log(file, index, "deleteFile");
        },
        removeLocation(num) {
            this.$confirm("Are you sure you want to delete?", "Delete Location", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                if (this.locations.length > 1) {
                    if (this.locations[num - 1] && this.locations[num - 1].id) this.locations[num - 1].isDeleted = true;
                    else this.locations.splice(num - 1, 1);
                }
            });
        },
        saveDocument(data, index) {
            if (this.locations[index - 1] && this.locations[index - 1].VendorDocuments) {
                this.locations[index - 1].VendorDocuments.push(data);
            }
            if (data.type === "pan") this.showPanFile = true;
            else if (data.type === "chq") this.showChq = true;
            else if (data.type === "gst") this.showGST = true;
            this.$forceUpdate();
        },
        confirmDelete(file, index) {
            const toDelete = this.locations[index - 1].VendorDocuments.find(a => a.type === file.type);
            this.locations[index - 1].VendorDocuments.indexOf(toDelete);

            this.$confirm("Are you sure you want to delete?", "Delete Certificate", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                this.locations[index - 1].VendorDocuments.splice(
                    this.locations[index - 1].VendorDocuments.indexOf(toDelete),
                    1,
                );

                if (file.type == "pan") this.showPanFile = false;
                if (file.type == "chq") this.showChq = false;
                if (file.type == "gst") this.showGST = false;

                if (file && !file.id) return;

                const route = this.type === "vendor" ? "vendor-document" : "contract-document";

                await this.$http.updateById(route, file.id, {
                    isDeleted: true,
                });

                this.$forceUpdate();
            });
        },
        showUploadedFilesSection(index) {
            if (this.mode === "add") return true;

            if (this.locations && this.locations[index - 1].VendorDocuments) {
                return this.locations[index - 1].VendorDocuments.filter(a => a.type === "other").length;
            }
            return false;
        },
        isGSTCopyRequired(index) {
            return this.locations[index - 1].gstVendorType === "registered";
        },
        selectGstVendorType(index, val) {
            if (val === "registered") {
                this.locations[index - 1].taxLiable = "true";
            } else {
                this.locations[index - 1].taxLiable = "false";
            }
        },
        isTaxLiableDisabled(index) {
            if (this.isDisabled) return true;
            return this.locations[index - 1].gstVendorType === "registered";
        },
        async getVendorLocation(index) {
            try {
                this.isFetching = true;
                this.selectedLocationIndex = index;
                const locationId = this.locations[index - 1].id;

                // if (locationId) {
                //     const location = await this.$http.get("vendor-location", {
                //         where: {
                //             vendorId: this.vendor.id,
                //             isDeleted: false,
                //             id: locationId,
                //         },
                //         attributes: {
                //             exclude: ["created_at", "updated_at"],
                //         },
                //         required: true,
                //         include: [
                //             {
                //                 model: "VendorBankDetail",
                //                 attributes: {
                //                     exclude: ["created_at", "updated_at"],
                //                 },
                //             },
                //             {
                //                 model: "VendorDocument",
                //                 attributes: {
                //                     exclude: ["created_at", "updated_at"],
                //                 },
                //                 where: {
                //                     isDeleted: false,
                //                 },
                //                 required: false,
                //             },
                //             {
                //                 model: "MstState",
                //             },
                //         ],
                //     });

                //     if (location && location.length) {
                //         this.locations[index - 1] = location[0];
                //     }
                // }
                this.isFetching = false;
            } catch (err) {
                this.isFetching = false;
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor"]),
        stateList() {
            return this.mstStates.map(v => ({ name: v.name, value: v.id }));
        },
        yesNoOptions() {
            const items = this.$utility.getYesNoOption();
            return items.map(i => ({ text: i.name, value: i.value }));
        },
        isDisabled() {
            return this.mode === "readOnly";
        },
    },
};
</script>

<template lang="pug">
div
    .grid-margin.stretch-card.my-2.mx-2.pb-1#location-detail
        .location-detailss.no-borders(
            v-for="index in locations.length",
            v-if="locations[index-1].isDeleted === false",
            :key="`location_${index}`"
        )
            b-card-header.p-0.my-2(header-tag='header', role='tab1')
                b-button.text-left(block='', href='#', variant='info', @click="getVendorLocation(index)" v-b-toggle="`location_${index}`")
                    span.font-weight-bold-400 S.No :  
                    |   {{ index }} | 
                    span.font-weight-bold-400 
                    span.separater 
                    span Contact Person Name :  
                        |    {{ locations[index-1].contactPersonName || '-' }} |   
                    span.separater 
                    span Contact Person Email :
                        |    {{ locations[index-1].email || '-' }} 
                i.fa.fa-times.locat.cursor-pointer(
                    v-if="index!==1 && mode === 'add'",
                    aria-hidden="true", 
                    @click="removeLocation(index)"
                )
                b-collapse(:id="`location_${index}`", :visible="index === 1 && !locations[index - 1].id",  accordion="my-accordion")
                    b-card-body.mh_100.text-center(v-if="isFetching && selectedLocationIndex === index")
                        b-spinner(label="Loading.Please wait...") 
                    b-card-body(v-else)
                        .card-body
                            //.pull-right.set-default
                                label.switch
                                    input(type="checkbox")
                                    span.slider.round
                            h5.font-weight-bold.vendor-custom-arrow-loc Location Details
                            form(@submit.prevent="addLocation", v-if="selectedLocationIndex === index")
                                div
                                    .forms-sample
                                        .row
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].contactPersonName",
                                                    attribute="Contact Person Name",
                                                    input-type="text-only",
                                                    :required="true",
                                                    placeholder="Contact Person Name",
                                                    :disabled="isDisabled",
                                                    :maxLength="50",
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].phoneNumber",
                                                    attribute="Phone Number",
                                                    v-b-tooltip.hover, 
                                                    title="Phone number should be 10 character long",
                                                    input-type="text-number",
                                                    :required="true",
                                                    placeholder="Phone Number",
                                                    :maxLength="10",
                                                    :disabled="isDisabled || index === 1"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].email",
                                                    attribute="Email",
                                                    input-type="email",
                                                    :required="false",
                                                    placeholder="Email",
                                                    :disabled="isDisabled",
                                                    :maxLength="50",
                                                )
                                        .row
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].address",
                                                    attribute="Address 1",
                                                    input-type="text",
                                                    :required="true",
                                                    placeholder="Street No, Street Name",
                                                    :maxLength="50",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].address2",
                                                    attribute="Address 2",
                                                    input-type="text",
                                                    :required="false",
                                                    placeholder="Street No, Street Name",
                                                    :maxLength="50",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].postCode",
                                                    attribute="Pin Code",
                                                    input-type="text-number",
                                                    v-b-tooltip.hover, 
                                                    title="Pin code should be 6 character long",
                                                    :required="true",
                                                    placeholder="Pin Code",
                                                    :maxLength="6",
                                                    :disabled="isDisabled"
                                                )
                                        .row
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].city",
                                                    attribute="City",
                                                    input-type="text-only",
                                                    :required="true",
                                                    placeholder="City",
                                                    :disabled="isDisabled",
                                                    :maxLength="50",
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].stateId",
                                                    attribute="State",
                                                    input-type="select-option",
                                                    :items="stateList",
                                                    :required="true",
                                                    placeholder="Search state",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].country",
                                                    attribute="Country",
                                                    input-type="text",
                                                    :required="true",
                                                    placeholder="Search country",
                                                    :disabled="true"
                                                )
                                        .row
                                            //- .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].landlineNumber",
                                                    attribute="Landline Number",
                                                    input-type="text-number",
                                                    :required="false",
                                                    placeholder="Landline Number",
                                                    :maxLength="10",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].panNumber",
                                                    attribute="Pan Number",
                                                    input-type="text",
                                                    v-b-tooltip.hover, 
                                                    title="PAN should be 10 character long",
                                                    :required="true",
                                                    placeholder="Pan Number",
                                                    :maxLength="10",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4
                                                form-field(
                                                    v-model="locations[index-1].taxLiable",
                                                    attribute="Tax Liable",
                                                    input-type="select-option",
                                                    :items="$utility.getYesNoOption()",
                                                    :required="true",
                                                    placeholder="Search",
                                                    :disabled="isTaxLiableDisabled(index)",
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].tinNumber",
                                                    attribute="TIN/VAT Number",
                                                    v-b-tooltip.hover, 
                                                    title="TIN Number should be 11 charater long and mandatory for liquor vendor",
                                                    input-type="text",
                                                    :required="false",
                                                    placeholder="TIN Number",
                                                    :maxLength="11",
                                                    :disabled="isDisabled",
                                                )
                                        .row
                                            .col-md-4
                                                form-field(
                                                    v-model="locations[index-1].gstVendorType",
                                                    attribute="GST Vendor Type",
                                                    input-type="select-option",
                                                    :items="$utility.getGSTVendorType()",
                                                    :required="true",
                                                    placeholder="Search GST Vendor Type",
                                                    :disabled="isDisabled",
                                                    @input="selectGstVendorType(index, $event)"
                                                )
                                            .col-md-4
                                                form-field(
                                                    v-model="locations[index-1].gstNumber",
                                                    attribute="GST Registration Number",
                                                    v-b-tooltip.hover, 
                                                    title="GST Registration Number should be 15 charater long",
                                                    input-type="text",
                                                    :required="locations[index-1].gstVendorType === 'registered'",
                                                    placeholder="GST Registration Number",
                                                    :maxLength="15",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].fssaiNumber",
                                                    v-b-tooltip.hover, 
                                                    title="FSSAI Number should be 14 charater long",
                                                    attribute="FSSAI Number",
                                                    input-type="text-number",
                                                    :required="false",
                                                    placeholder="FSSAI Number",
                                                    :maxLength="14",
                                                    :disabled="isDisabled"
                                                )
                                            .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].fssaiValidTill",
                                                    input-type="date",
                                                    attribute="FSSAI Valid Till",
                                                    :required="locations[index - 1].fssaiNumber ? true : false",
                                                    placeholder="FSSAI Valid Till",
                                                    :maxLength="14",
                                                    :disabled="isDisabled"
                                                )
                                            
                                            //- .col-md-4.mb-2
                                                form-field(
                                                    v-model="locations[index-1].fax",
                                                    attribute="FAX Number",
                                                    input-type="text-number",
                                                    :required="false",
                                                    placeholder="FAX Number",
                                                    :disabled="isDisabled"
                                                )
                                        .col-md-12.bbq-cust-button.upload-btn.mb-2
                                            upload-vendor-documents.star(
                                                type="pan",
                                                :data="locations[index-1].VendorDocuments",
                                                label="PAN",
                                                :mode="mode",
                                                :documentType="'location'",
                                            )
                                        .col-md-12.bbq-cust-button.upload-btn.mb-2
                                            upload-vendor-documents.star(
                                                type="chq",
                                                :data="locations[index-1].VendorDocuments",
                                                label="Cancel Cheque",
                                                :mode="mode",
                                                :documentType="'location'",
                                            )
                                        .col-md-12.bbq-cust-button.upload-btn.mb-2
                                            upload-vendor-documents.star(
                                                type="invoice",
                                                :data="locations[index-1].VendorDocuments",
                                                label="Sample Invoice",
                                                :mode="mode",
                                                :documentType="'location'",
                                            )
                                        .col-md-12.bbq-cust-button.upload-btn.mb-2
                                            upload-vendor-documents(
                                                :class="{'star' : isGSTCopyRequired(index), 'star1' : !isGSTCopyRequired(index) }"
                                                type="gst",
                                                :data="locations[index-1].VendorDocuments",
                                                label="GST Ack. Copy",
                                                :mode="mode",
                                                :documentType="'location'",
                                            )
                                        .col-md-12.bbq-cust-button.upload-btn.mb-2
                                            upload-vendor-documents.star1(
                                                type="fssai",
                                                :data="locations[index-1].VendorDocuments",
                                                label="FSSAI certificate",
                                                :mode="mode",
                                                :documentType="'location'",
                                            )
                                        upload-document(
                                            v-if="mode === 'add'",
                                            label="OTHERS",
                                            type="other",
                                            :showHeading="false",
                                            belongsTo="location",
                                            @save="saveDocument($event, index)"
                                        )
                                    span.text-muted.mb-5(v-if="mode === 'add'") Accepted file types are: jpg, jpeg, png, pdf.
                                    uploaded-files-list(
                                        v-if="showUploadedFilesSection(index)",
                                        :files="locations[index-1].VendorDocuments && locations[index-1].VendorDocuments.length ? locations[index-1].VendorDocuments.filter(a => a.type === 'other') : []",
                                        :mode="mode",
                                        :showUploadedBy="false",
                                        :showFileType="true",
                                        @remove="removeFile($event, index)"
                                    )
                                bank-detail-section#bank-detail(
                                    :vendor="vendor",
                                    :banks="locations[index-1].VendorBankDetails",
                                    :mode="mode",
                                    :locationIndex="index",
                                )
                        //view-contract-detail(
                            title="",
                            :vendor="vendorData",
                            :contract="contract",
                            :contractItems="contract.ContractItems",
                            :supercategory="contractSuperCategory(contract)",
                            :areas="contract.ContractAreas.map(a => a.MstArea ? a.MstArea.name : null).join(',')",
                            :allAreas="allAreas",
                         )
                            button.btn.btn-primary.mr-1.background-barbique(type='button', @click="renewContract(contract)") Renew Contract
            //i.fa.fa-times.locat.cursor-pointer(
                v-if="index!==1 && mode === 'add'",
                aria-hidden="true", 
                @click="removeLocation(index)"
             )
    .text-center.pb-3(v-if="mode === 'add'")
        button.btn.btn-lg.bbq-btn-primary(
            type="submit", 
            @click="addLocation"
        )
            i.fa.fa-plus(aria-hidden="true")
            | Add Another Location
</template>
<style>
.loc-det {
    padding: 15px 0;
    position: relative;
}
#location-detail .forms-sample label {
    color: #000;
}
.mh_100 {
    min-height: 100px;
}
</style>
