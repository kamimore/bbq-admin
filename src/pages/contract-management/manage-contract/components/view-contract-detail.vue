<script>
import { mapGetters } from "vuex";
import UploadedFilesList from "@pages/vendor-management/vendor-profile/components/uploaded-files-list";
import UploadDocument from "@pages/vendor-management/vendor-profile/components/upload-document";
import { VueEditor } from "vue2-editor";
import Contract from "./contract-pdf";

export default {
    name: "ViewContractDetail",
    components: {
        UploadedFilesList,
        UploadDocument,
        VueEditor,
        Contract,
    },
    props: {
        title: {
            type: String,
            default: "",
        },
        vendor: {
            type: Object,
            default: () => {},
        },
        contract: {
            type: Object,
            default: () => {},
        },
        contractItems: {
            type: Array,
            default: () => [],
        },
        supercategory: {
            type: Object,
            default: () => {},
        },
        areas: {
            type: String,
            default: "",
        },
        showLogo: {
            type: Boolean,
            default: false,
        },
        categoryAdvancePayment: {
            type: Array,
            default: () => [],
        },
        categoryDeliveryTerm: {
            type: Array,
            default: () => [],
        },
        showUplodedFiles: {
            type: Boolean,
            default: true,
        },
        allAreas: {
            type: Array,
            default: () => [],
        },
        isModal: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            serviceHeaders: [
                { text: "Item Name", value: "MstItem.name", align: "left", width: "15%", sortable: false },
                { text: "Price (₹)", value: "newPrice", align: "center", width: "70%", sortable: false },
                // { text: "Vendor Price (₹)", value: "vendorPrice", align: "center", sortable: false, width: "15%" },
            ],
            contractApprovalHeaders: [
                { text: "Employee Code", value: "User.userName", align: "left", sortable: false },
                { text: "User", value: "User.fullName", align: "center", sortable: false },
                { text: "Status", value: "status", align: "center", sortable: false },
                { text: "Review Date", value: "reviewedDate", align: "center", sortable: false },
                { text: "Comment", value: "comment", align: "center", sortable: false },
            ],
            itemSpecificationHeader: [
                { text: "Item Code", value: "MstItem.code", align: "left", sortable: false },
                { text: "Item Name", value: "MstItem.name", align: "center", sortable: false },
                { text: "Unit Detail", value: "MstItem.unit", align: "center", sortable: false },
                // { text: "Brand", value: "brand", align: "center", sortable: false },
                { text: "Specification", value: "specification", align: "center", sortable: false },
            ],
            showVendorPrice: false,
            mstPaymentTerms: null,
            changePrice: false,
            annexureAreas: [],
            loggedInUser: this.$store.getters["account/getUser"],
            print: false,
        };
    },
    created() {
        this.getAnnexureData();
    },
    methods: {
        saveDocument(data) {
            if (this.contract.ContractDocuments) {
                this.contract.ContractDocuments.push(data);
            }
        },
        downloadAsPDF() {
            this.$htmlToPaper("contractPDF", f => f);
        },
        async getAnnexureData() {
            let areaIds = [];

            if (this.contract.areaIds && this.contract.areaIds.length) {
                areaIds = this.contract.areaIds.map(a => a.value);
            } else if (this.contract.ContractAreas && this.contract.ContractAreas.length) {
                areaIds = this.contract.ContractAreas.map(a => a.areaId);
            }

            if (areaIds && areaIds.length) {
                if (this.allAreas && this.allAreas.length) {
                    this.annexureAreas = this.allAreas.filter(a => areaIds.includes(a.id));
                    return;
                }
                const allAreas = await this.$http.get("mst-area", {
                    // where: {
                    //     id: {
                    //         $in: areaIds,
                    //     },
                    // },
                    include: [
                        {
                            model: "MstState",
                            attributes: {
                                exclude: ["created_at", "updated_at"],
                            },
                        },
                        {
                            model: "MstRegion",
                            attributes: {
                                exclude: ["created_at", "updated_at"],
                            },
                        },
                        {
                            model: "MstCity",
                            attributes: {
                                exclude: ["created_at", "updated_at"],
                            },
                        },
                    ],
                });
                this.annexureAreas = allAreas.filter(a => areaIds.includes(a.id));
            }
        },
        getAddress(area) {
            let address = "";

            if (area.MstRegion && area.MstRegion.name) address += `${area.MstRegion.name}, `;
            if (area.name) address += `${area.name}, `;
            if (area.address1) address += `${area.address1}, `;
            if (area.address2) address += `${area.address2}, `;
            if (area.postCode) address += `${area.postCode}`;

            return address;
        },
        // contractCategories() {
        //     if(this.contract.ContractCategories && this.contract.ContractCategories.length) {
        //         const categories = this.contract.ContractCategories.map(a => a.MstCategory.name);
        //         console.lgo({categories})
        //         return categories.join(', ')
        //     };

        //     return null
        // }
    },
    computed: {
        ...mapGetters("account", [
            "isVendor",
            "isSourcingTeam",
            "isSuperAdmin",
            "isCoorporateSourcingTeam",
            "isSourcingRole",
        ]),
        showAdvancePayment() {
            const advancePaymentIds = this.categoryAdvancePayment.map(a => a.subCategoryId);
            return advancePaymentIds.includes(+this.contract.categoryId);
        },
        showDeliveryTerm() {
            const deliveryTermIds = this.categoryDeliveryTerm.map(a => a.subCategoryId);
            return deliveryTermIds.includes(+this.contract.categoryId);
        },
        showVendorPriceToAdmin() {
            if (this.isVendor) return true;
            if (this.isSuperAdmin) return false;

            if (this.contract) {
                return ["change_request", "approved", "rejected_by_vendor"].includes(this.contract.status);
            }
            return false;
        },
        isApprovedContract() {
            if (!this.isVendor) {
                return ["approved", "change_request", "rejected_by_vendor"].includes(this.contract.status);
            }
            return false;
        },
        showFinalPriceColumn() {
            return this.contract && ["approved", "sent_to_co_sourcing"].includes(this.contract.status);
        },
        showChangePrice() {
            if (!this.changePrice) return true;
            if (this.contract.status === "sent_to_vendor" && !this.changePrice) return true;

            return false;
        },
        disableCommentBox() {
            if (this.isSuperAdmin) {
                return true;
            }
            if (!this.isVendor && this.contract.status === "sent_to_vendor") return true;
            return !["sent_to_vendor", "change_request"].includes(this.contract.status);
        },
        showCommentBox() {
            if (this.isSuperAdmin) return false;
            if (this.isCoorporateSourcingTeam && this.contract.status === "draft") return false;
            if (this.isSourcingTeam && this.contract.status === "draft") return false;

            return true;
        },
        showCommentText() {
            if (this.contract.status === "draft") return false;
            return true;
        },
        showVendorComment() {
            return this.showCommentText && !this.isVendor && this.contract.vendorComment;
        },
        showBBQComment() {
            return (
                // this.showCommentText &&
                !(this.isCoorporateSourcingTeam || this.isSourcingTeam) && this.contract.bbqComment
            );
        },
        showUploadedFiles() {
            return this.contract.ContractDocuments && this.contract.ContractDocuments.length;
        },
        hasVendorLocation() {
            return this.vendor && this.vendor.VendorLocations && this.vendor.VendorLocations.length;
        },
        itemsWithSpecification() {
            return this.contractItems.filter(i => i.specification);
        },
        computedHeaders() {
            const headers = [
                { text: "Item Code", value: "MstItem.code", sortable: false, width: "10%" },
                { text: "Item Name", value: "MstItem.name", align: "center", sortable: false, width: "20%" },
                { text: "Unit Detail", value: "MstItem.unit", align: "center", sortable: false, width: "20%" },
                { text: "Brand", value: "brand", align: "center", sortable: false },
                { text: "Image", value: "imageUrl", align: "center", sortable: false },
            ];

            if (this.showFinalPriceColumn) {
                headers.push({ text: "Final Price (₹)", value: "finalPrice", align: "center", sortable: false });
                // headers.push({ text: "GST (%)", value: "tax", sortable: false, align: "center" });
            } else {
                headers.push({ text: "Price (₹)", value: "newPrice", align: "center", sortable: false });
                // headers.push({ text: "GST (%)", value: "tax", sortable: false, align: "center" });
                // headers.push({ text: "Price + GST (₹)", value: "", sortable: false, align: "center" });

                if (this.showVendorPriceToAdmin || this.changePrice) {
                    headers.push({
                        text: "Vendor Price (₹)",
                        value: "vendorPrice",
                        align: "center",
                        sortable: false,
                        width: "10%",
                    });
                }

                // if (this.showVendorPriceToAdmin || this.changePrice) {
                //     headers.push({
                //         text: "Vendor Price + GST (₹)",
                //         value: "vendorPrice",
                //         align: "center",
                //         sortable: false,
                //         width: "10%",
                //     });
                // }
            }

            return headers;
        },
        computedServiceHeader() {
            const items = this.serviceHeaders.slice();

            if (this.contract.status && this.contract.status !== "draft") {
                items.push({
                    text: "Vendor Price (₹)",
                    value: "vendorPrice",
                    align: "center",
                    sortable: false,
                    width: "15%",
                });
            }

            return items;
        },
        showVendorInputInService() {
            return this.contract.status && this.contract.status !== "draft";
        },
        contractCategories() {
            if(this.contract.ContractCategories && this.contract.ContractCategories.length) {
                const categories = this.contract.ContractCategories.map(a => a.MstCategory.name);
                return categories.join(', ');
            }
            return null
        }
    },
    watch: {
        "contract"() {
            this.getAnnexureData();
        },
        "contract.areaIds"() {
            this.getAnnexureData();
        },
        "contract.ContractAreas"() {
            this.getAnnexureData();
        },
    },
};
</script>

<template lang="pug">
.view-contract-details
    .col-md-12.page-header(v-if="showLogo")
        .logo1.text-left
            img(src='@assets/images/logo1.png')
        .contract-heading.text-center.mt-3
            h3 Agreement
    .contract-view(:class="{'sweet-modal-max-height' : isModal}")
        .container-fluid
            .cv
                .mb-2.pt-15px(v-if="!$lodash.isEmpty(vendor)")
                    .card
                        .card-header.font-16.font-weight-400 Vendor Detail
                        .card-body
                            .row    
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Code :
                                        .col-sm-8.col-7
                                            p.text-black1 {{ vendor.bbqVendorId || '-'}}
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Name : 
                                        .col-sm-8.col-7
                                            p.text-black1 {{vendor.companyName || '-'}}
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Email : 
                                        .col-sm-8.col-7
                                            p.text-black1(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].email ? vendor.VendorLocations[0].email : '-'}}
                                            p.text-black1(v-else) -
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Vendor Type : 
                                        .col-sm-8.col-7
                                            p.text-black1 {{ vendor.type | humanize}}
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Contact :
                                        .col-sm-8.col-7
                                            p.text-black1(v-if="hasVendorLocation") {{vendor.VendorLocations[0].contactPersonName ? vendor.VendorLocations[0].contactPersonName : '-'}}
                                            p.text-black1(v-else) -
                                .col-sm-6(v-if="contract.contractType === 'one_time'")
                                    .row
                                        .col-sm-4.col-5
                                            p Cash Limit :
                                        .col-sm-8.col-7
                                            p.text-black1 {{vendor.cashLimit || '-'}}
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p Phone Number :
                                        .col-sm-8.col-7
                                            p.text-black1 {{hasVendorLocation ? vendor.VendorLocations[0].phoneNumber : '-'}}
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p.mar-bottom-o GSTN :
                                        .col-sm-8.col-7
                                            p.text-black1.mar-bottom-o(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].gstNumber ? vendor.VendorLocations[0].gstNumber : '-'}}
                                            p.text-black1.mar-bottom-o(v-else) -
                                .col-sm-6
                                    .row
                                        .col-sm-4.col-5
                                            p.mar-bottom-o PAN :
                                        .col-sm-8.col-7
                                            p.text-black1.mar-bottom-o(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].panNumber? vendor.VendorLocations[0].panNumber : '-'}}
                                            p.text-black1.mar-bottom-o(v-else) -
                .mb-2
                    .card
                        .card-header.font-16.font-weight-400 Contract Details
                        .card-body
                            .row
                                .col-sm-6
                                    .row    
                                        .col-sm-4.col-5
                                            p Contract Date :
                                        .col-sm-8.col-7
                                            p.text-black1 
                                                span From 
                                                span.font-weight-bold {{contract.fromDate | date-format }} 
                                                span to 
                                                span.font-weight-bold {{contract.toDate | date-format}}
                                    .row    
                                        .col-sm-4.col-5
                                            p.no-mar-padd Payment Term :
                                        .col-sm-8.col-7
                                            p.text-black1.no-mar-padd(v-if="contract && contract.MstPaymentTerm")  {{ contract.MstPaymentTerm.code ? contract.MstPaymentTerm.code + ' from the date of supply' : '-' }}
                                            p.text-black1.no-mar-padd(v-else)  {{ contract.paymentTermId ? contract.paymentTermId.code + ' from the date of supply' : '-' }}
                                    
                                .col-sm-6
                                    .row    
                                        .col-sm-4.col-5
                                            p Category :
                                        .col-sm-8.col-7
                                            p.text-black1(v-if="supercategory.MstSuperCategory") {{ supercategory ? supercategory.MstSuperCategory.name : '-'}}
                                            p.text-black1(v-else) {{ supercategory ? supercategory.name : '-'}}
                                    .row    
                                        .col-sm-4.col-5
                                            p.no-mar-padd Sub Category :
                                        .col-sm-8.col-7
                                            p.text-black1.no-mar-padd(v-if="contractCategories")  {{ contractCategories || '-' | capitalize}}
                                            p.text-black1.no-mar-padd(v-else)  {{ supercategory.name || '-' | capitalize}}
                                .col-sm-6
                                    .row(v-if="showAdvancePayment")
                                        .col-sm-4.col-5
                                            p.no-mar-padd Advance Payment :
                                        
                                        .col-sm-8.col-7(v-if="contract.advancePayment")
                                            p.text-black1.no-mar-padd(v-if=" typeof contract.advancePayment === 'object'")  {{ contract.advancePayment.value == 0 ? '-' : contract.advancePayment.value + ' %' || '-' }}
                                            p.text-black1.no-mar-padd(v-else)  {{ ( contract.advancePayment == 0 ? '-' : contract.advancePayment + ' %') || '-' }}
                                        .col-sm-8.col-7(v-else) -
                                .col-sm-6
                                    .row(v-if="showDeliveryTerm")
                                        .col-sm-4.col-5
                                            p.no-mar-padd Delivery Term :
                                        
                                        .col-sm-8.col-7(v-if="contract.deliveryTerm")
                                            span(v-if="typeof contract.deliveryTerm === 'object'")
                                                p.text-black1.no-mar-padd(v-if="contract.deliveryTerm.value == 0 || contract.deliveryTerm.period == '-'")  -
                                            span(v-else)
                                                p.text-black1.no-mar-padd(v-if="contract.deliveryTerm == '0 -'")  -
                                        
                                            p.text-black1.no-mar-padd(v-if="typeof contract.deliveryTerm === 'object'")  {{ contract.deliveryTerm.value + ' ' + contract.deliveryTerm.period  || '-' }}
                                            p.text-black1.no-mar-padd(v-else)  {{ contract.deliveryTerm || '-' }}
                                        .col-sm-8.col-7(v-else) -
                                .col-sm-12
                                    .row    
                                        .col-sm-2.col-2
                                            p Location :
                                        .col-sm-10.col-10
                                            p.text-black1 {{ areas | capitalize }}
                .mb-2
                    .card
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Item Detail
                                .col-sm-8
                                    b-form-checkbox.cust-input.text-right(
                                        v-if="contract.status === 'sent_to_vendor' && isVendor",
                                        v-model="changePrice",
                                        attribute="Change Price",
                                        :showLabel="true",
                                        @input="$emit('changePrice', changePrice)"
                                        input-type="checkbox"
                                    ) Change Price
                        .card-body
                            v-app
                                // One time service
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    v-if="contract.contractService === 'service'",
                                    :headers="computedServiceHeader", 
                                    :items='contractItems', 
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items='{ item }')
                                        td.text-left {{ item.itemName ? item.itemName : '-' }}
                                        td.text-center {{ item.newPrice || '-'}}
                                        td.text-center(v-if="showVendorInputInService")
                                            input.form-control.text-center(type='number', :disabled="!changePrice", v-model="item.vendorPrice") 
                                // Recurring contract
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(  
                                    v-else,   
                                    :headers="computedHeaders"
                                    :items='contractItems',
                                    :rows-per-page-items="[10000]", 
                                    hide-actions
                                )
                                    template(v-slot:items='{ item }')
                                        td.text-left {{ item.MstItem ? item.MstItem.code : '-' }}
                                        td.text-center {{ item.MstItem ? item.MstItem.name : '-' }}
                                        td.text-center {{ item.MstItem ? item.MstItem.unit : '-'}}
                                        td.text-center {{ item.brand || '-'}}
                                        td.text-center 
                                            span.close-star.width_100
                                                span.link(
                                                    @click="$utility.downloadFile(item.imageUrl)"
                                                ) {{ item.imageName }}
                                        td.text-center(v-if="showFinalPriceColumn") {{item.finalPrice || '-'}}
                                        td.text-center(v-if="!showFinalPriceColumn") {{item.newPrice || '-'}} 
                                        //- td.text-center {{item.tax || '-'}}
                                        //- td.text-center(v-if="!item.finalPrice") 0
                                        //- td.text-center(v-else-if="!showFinalPriceColumn && item.finalPrice") {{ item.finalPrice | calculatePriceWithTax(item.tax)}}
                                        td.text-center(v-if="!showFinalPriceColumn && (changePrice || showVendorPriceToAdmin)")
                                            input.form-control.text-center(
                                                type='text', 
                                                :disabled="!changePrice", 
                                                v-model="item.vendorPrice",
                                                onkeypress='return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46',
                                                :maxLength="7"
                                            ) 
                                        //- td.text-center(v-if="!showFinalPriceColumn && (changePrice || showVendorPriceToAdmin)") {{ item.vendorPrice | calculatePriceWithTax(item.tax)}}
                                // Mobile View
                                div.ismobile
                                    ul.flex-content(v-for="item of contractItems")
                                        li.flex-item(data-label='Item Code') {{ item.MstItem ? item.MstItem.code : '-'  }}
                                        li.flex-item(data-label='Item Name') {{ item.MstItem ? item.MstItem.name : '-'  }}
                                        li.flex-item(data-label='Unit') {{ item.MstItem ? item.MstItem.unit : '-'}} 
                                        li.flex-item(data-label='Brand') {{ item.brand ? item.brand : '-'}}
                                        li.flex-item(data-label='Image') 
                                            span.close-star.width_100
                                                span.link(
                                                    @click="$utility.downloadFile(item.imageUrl)"
                                                ) {{ item.imageName }}
                                        li.flex-item(data-label='New Price (₹) / unit') {{ item.newPrice || '-'}}
                                        //- li.flex-item(v-if="showVendorPriceToAdmin")  {{ item.vendorPrice | calculatePriceWithTax(item.tax)}}
                                        //- li.flex-item(v-else-if="isApprovedContract")  {{ item.finalPrice | calculatePriceWithTax(item.tax)}}
                                        li.flex-item(v-if="!item.vendorPrice && item.finalPrice") 0
                                        //- li.flex-item(data-label='GST') {{ item.tax || '-'}} 
                                        li.flex-item(data-label='Vendor Price (₹) / unit',v-if="isApprovedContract") {{ item.vendorPrice }}
                                        li.flex-item(data-label='Vendor Price (₹) / unit', v-else-if="showVendorPriceToAdmin")
                                            input.form-control.text-center(type='number',id='', :disabled="!changePrice", v-model="item.vendorPrice")
                .mb-2(v-if="itemsWithSpecification && itemsWithSpecification.length")
                    .card
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Item Specification  
                        .card-body
                            v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                :headers="itemSpecificationHeader"
                                :items='itemsWithSpecification',
                                :rows-per-page-items="[10000]", 
                                hide-actions
                            )
                                template(v-slot:items='{ item }')
                                    td.text-left {{ item.MstItem ? item.MstItem.code : '-' }}
                                    td.text-center {{ item.MstItem ? item.MstItem.name : '-' }}
                                    td.text-center(v-if="item.MstItem") {{ item.MstItem.unit | capitalize}}
                                    td.text-center(v-else) -
                                    //- td.text-center {{ item.brand ? item.brand : '-'}}
                                    td.text-center {{ item.specification ? item.specification : '-'}}
                .mb-2
                    .card
                        .card-header.font-16.font-weight-400 Terms & Conditions
                        .card-body
                            p.card-text.term-condition-text(v-if="contract.termCondition" v-html="contract.termCondition")
                            p.card-text.term-condition-text.text-muted(v-else) No term and condition found.
                .mb-2(v-if="!isVendor && contract.contractApprovalRequests && contract.contractApprovalRequests.length",)
                    .card
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Contract Approval Status
                        .card-body
                            v-app
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    :headers="contractApprovalHeaders", 
                                    :items='contract.contractApprovalRequests', 
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items='{ item }')
                                        td.text-left {{ item.User ? item.User.userName : '-' }}
                                        td.text-center {{ item.User ? item.User.fullName : '-'}}
                                        td.text-center
                                            status-color(:type="item.status", :text="item.status")
                                        td.text-center {{ item.reviewedDate | date-format}}
                                        td.text-center {{ item.comment || '-'}}
                .mb-2
                    .card
                        .card-header.font-16.font-weight-400 Annexure
                        .card-body
                            div(v-if="annexureAreas && annexureAreas.length")
                                div.annexure(v-for="(areas, index) in annexureAreas")
                                    span.text-left-400 {{index+1}}:  
                                    span.text-left {{ getAddress(areas) | capitalize }}
                            div(v-else)
                                span No location found.
                .mb-2(v-if="(isCoorporateSourcingTeam || isSuperAdmin) && showUplodedFiles")
                    .card
                        .card-header.font-16.font-weight-400  Uploaded Documents
                        .card-body
                            .row
                                .col-sm-12
                                    uploaded-files-list(
                                        type="vendor",
                                        :mode="contract.status === 'sent_to_co_sourcing' ? 'add' : 'readOnly'",
                                        :files="contract.ContractDocuments",
                                        :showHeading="false"
                                    )                        
                //- .mb-2(v-if="showVendorComment")
                    .card
                        .card-header.font-16.font-weight-400 Vendor Comment   
                        .card-body {{contract.vendorComment || 'No comment added'}}
                //- .mb-2(v-if="showBBQComment")
                    .card
                        .card-header.font-16.font-weight-400 BBQ Comment   
                        .card-body {{contract.bbqComment || 'No comment added'}}
                //- .mb-2(v-if="!disableCommentBox && showCommentBox && !(isCoorporateSourcingTeam || isSourcingTeam)")
                    .card
                        .card-header.font-16.font-weight-400  Comment
                        .card-body
                            form-field-input(
                                v-model="contract.vendorComment",
                                attribute="Comment",
                                placeholder="Enter your comment"
                                inputType="textarea",
                                :required="true",
                                :disabled="disableCommentBox"
                            )
                //- .mb-2(v-if="!disableCommentBox && showCommentBox && !isVendor")
                    .card
                        .card-header.font-16.font-weight-400  Comment
                        .card-body
                            form-field-input(
                                v-model="contract.bbqComment",
                                attribute="Comment",
                                placeholder="Enter your comment"
                                inputType="textarea",
                                :required="true",
                                :disabled="disableCommentBox"
                            )
                .mb-2.center(v-if="isCoorporateSourcingTeam && contract.status === 'sent_to_co_sourcing'")
                    upload-document(
                        belongsTo="co_sourcing",
                        :showUnderlineHeading="true",
                        @save="saveDocument"
                    )
                contract#contractPDF(
                    v-show="print",
                    :contract="contract",
                    :contractItems="contractItems",
                    :vendor="vendor",
                    :supercategory="supercategory",
                    :areas="areas",
                    :showLogo="true",
                    :annexureAreas="annexureAreas",
                    :categoryAdvancePayment="categoryAdvancePayment",
                    :categoryDeliveryTerm="categoryDeliveryTerm",
                    @changePrice="changePrice($event)",
                ) 
    .pt-2.pb-2.text-center
        slot
</template>

<style lang="scss">
input.form-control {
    width: 100%;
}
p.term-condition-text p br {
    display: none;
}
.td-width-25 {
    width: 250px;
}
.td-width-10 {
    width: 100px;
}
.td-width-8 {
    width: 80px;
}
.td-width-12 {
    width: 120px;
}
.td-width-15 {
    width: 150px;
}
.td-width-12 {
    width: 120px;
}
.td-width-5 {
    width: 50px;
}
</style>
