<script>
import { mapGetters } from "vuex";
import UploadedFilesList from "@pages/vendor-management/vendor-profile/components/uploaded-files-list";
import UploadDocument from "@pages/vendor-management/vendor-profile/components/upload-document";
import { VueEditor } from "vue2-editor";

export default {
    name: "Contract",
    components: {
        UploadedFilesList,
        UploadDocument,
        VueEditor,
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
        annexureAreas: {
            Type: Array,
            default: () => [],
        },
        categoryAdvancePayment: {
            type: Array,
            default: () => [],
        },
        categoryDeliveryTerm: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            serviceHeaders: [
                { text: "Item Name", value: "MstItem.name", align: "left", width: "40%" },
                { text: "Price (₹)", value: "newPrice", align: "center", width: "40%" },
                // { text: "Vendor Price (₹)", value: "vendorPrice", align: "center", sortable: false, width: "20%" },
            ],
            itemSpecificationHeader: [
                { text: "Item Code", value: "MstItem.code", align: "left" },
                { text: "Item Name", value: "MstItem.name", align: "center" },
                { text: "Unit Detail", value: "MstItem.unit", align: "center" },
                // { text: "Brand", value: "brand", align: "center" },
                { text: "Specification", value: "specification", align: "center" },
            ],
            showVendorPrice: false,
            mstPaymentTerms: null,
            changePrice: false,
            loggedInUser: this.$store.getters["account/getUser"],
        };
    },
    methods: {
        downloadAsPDF() {
            this.$htmlToPaper("contractPDF", f => f);
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
    },
    computed: {
        ...mapGetters("account", ["isVendor", "isSuperAdmin"]),
        showVendorPriceToAdmin() {
            if (this.isVendor) return true;
            if (this.isSuperAdmin) return false;

            if (this.contract) {
                return ["change_request", "approved", "rejected_by_vendor"].includes(this.contract.status);
            }
            return false;
        },
        showAdvancePayment() {
            const advancePaymentIds = this.categoryAdvancePayment.map(a => a.subCategoryId);
            return advancePaymentIds.includes(+this.contract.categoryId);
        },
        showDeliveryTerm() {
            const deliveryTermIds = this.categoryDeliveryTerm.map(a => a.subCategoryId);
            return deliveryTermIds.includes(+this.contract.categoryId);
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
                this.showCommentText &&
                !(this.isCoorporateSourcingTeam || this.isSourcingTeam) &&
                this.contract.bbqComment
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
                { text: "Item Code", value: "MstItem.code", align: "left" },
                { text: "Item Name", value: "MstItem.name", align: "center" },
                { text: "Unit Detail", value: "MstItem.unit", align: "center" },
                { text: "Brand", value: "brand", align: "center", sortable: false },
            ];

            if (this.showFinalPriceColumn) {
                headers.push({ text: "Final Price (₹)", value: "finalPrice", align: "center", sortable: false });
                // headers.push({ text: "GST (%)", value: "tax", sortable: false, align: "center" });
            } else {
                headers.push({ text: "Price (₹)", value: "newPrice", align: "center" });
                // headers.push({ text: "GST (%)", value: "tax", sortable: false, align: "center" });
                // headers.push({ text: "Price + GST (₹)", value: "", sortable: false, align: "center" });

                if (this.showVendorPriceToAdmin || this.changePrice) {
                    headers.push({
                        text: "Vendor Price (₹)",
                        value: "vendorPrice",
                        align: "center",
                        sortable: false,
                    });
                }

                // if (this.showVendorPriceToAdmin || this.changePrice) {
                //     headers.push({
                //         text: "Vendor Price + GST (₹)",
                //         value: "vendorPrice",
                //         align: "center",
                //         sortable: false,
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
    },
};
</script>

<template lang="pug">
.row#contractPDF.print-break-page(ref="contract")
    .col-md-12.page-header(style="padding-bottom:40px;", v-if="showLogo")
        .logo1.text-left(style="width: 83px;margin: 0;position: relative;float:left;top: 0;left: 24px;")
            img.mb-4(src='@assets/images/logo1.png')
        .contract-heading.text-center(style="padding-top:25px;")
            h3 Agreement
    .col-sm-12(v-if="!$lodash.isEmpty(vendor)")
        .card.custom-shadow
            .card-header.font-16.font-weight-bold Vendor Detail
            .card-body
                .row    
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Code :
                            .col-sm-7
                                p.text-black1 {{ vendor.bbqVendorId || '-'}}
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Name : 
                            .col-sm-7
                                p.text-black1 {{vendor.companyName || '-'}}
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Email : 
                            .col-sm-7
                                p.text-black1(v-if="hasVendorLocation") {{vendor.VendorLocations[0].email ? vendor.VendorLocations[0].email : '-'}}
                                p.text-black1(v-else) -
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Vendor Type : 
                            .col-sm-7
                                p.text-black1 {{ vendor.type }}
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Contact :
                            .col-sm-7
                                p.text-black1(v-if="hasVendorLocation") {{vendor.VendorLocations[0].contactPersonName ?vendor.VendorLocations[0].contactPersonName : '-'}}
                                p.text-black1(v-else) -
                    .col-sm-6(v-if="contract.contractType === 'one_type'")
                        .row
                            .col-sm-5
                                p Cash Limit :
                            .col-sm-7
                                p.text-black1 {{vendor.cashLimit || '-'}}
                    .col-sm-6
                        .row
                            .col-sm-5
                                p Phone Number :
                            .col-sm-7
                                p.text-black1(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].phoneNumber ? vendor.VendorLocations[0].phoneNumber : '-'}}
                                p.text-black1(v-else) -
                    .col-sm-6
                        .row
                            .col-sm-5
                                p GSTN :
                            .col-sm-7
                                p.text-black1(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].gstNumber ? vendor.VendorLocations[0].gstNumber : '-'}}
                                p.text-black1(v-else) -
                    .col-sm-6
                        .row
                            .col-sm-5
                                p PAN :
                            .col-sm-7
                                p.text-black1(v-if="hasVendorLocation") {{ vendor.VendorLocations[0].panNumber ? vendor.VendorLocations[0].panNumber : '-'}}
                                p.text-black1(v-else) -
    .col-sm-12.mb-3
        .card.custom-shadow
            .card-header.font-16.font-weight-bold Contract Details
            .card-body
                .row
                    .col-sm-6
                        .row    
                            .col-sm-5
                                p Contract Date :
                            .col-sm-7
                                //p.text-black1.font-weight-bold From {{contract.fromDate | date-format }} to {{contract.toDate | date-format}}
                                p.text-black1 
                                    span From 
                                    span.font-weight-bold {{contract.fromDate | date-format }} 
                                    span to 
                                    span.font-weight-bold {{contract.toDate | date-format}}
                        .row    
                            .col-sm-5
                                p Payment Term :
                            .col-sm-7
                                p.text-black1(v-if="contract.MstPaymentTerm")  {{ contract.MstPaymentTerm ? contract.MstPaymentTerm.code + ' from the date of supply' : '-' }}
                                p.text-black1(v-else)  {{ contract.paymentTermId ? contract.paymentTermId.code + ' from the date of supply' : '-' }}
                                
                    .col-sm-6
                        .row    
                            .col-sm-5
                                p Category :
                            .col-sm-7
                                p.text-black1(v-if="supercategory") {{ supercategory.name | capitalize}}
                                p.text-black1(v-else) -
                        .row    
                            .col-sm-5
                                p.no-mar-padd Sub Category :
                            .col-sm-7
                                p.text-black1.no-mar-padd(v-if="contract && contract.MstCategory")  {{ contract.MstCategory.name | capitalize}}
                                p.text-black1.no-mar-padd(v-else)  -
                        
                    .col-sm-6    
                        .row(v-if="showAdvancePayment")
                            .col-sm-5
                                p.no-mar-padd Advance Payment :
                            
                            .col-sm-7(v-if="contract.advancePayment")
                                p.text-black1.no-mar-padd(v-if="typeof contract.advancePayment === 'object'")  {{ contract.advancePayment.value == 0 ? '-' : contract.advancePayment.value + ' %' || '-' }}
                                p.text-black1.no-mar-padd(v-else)  {{ contract.advancePayment == 0 ? '-' : (contract.advancePayment + ' %') || '-' }}
                            .col-sm-7(v-else) -
                        
                    .col-sm-6
                        .row(v-if="showDeliveryTerm")
                            .col-sm-5
                                p.no-mar-padd Delivery Term :
                            
                            .col-sm-7(v-if="contract.deliveryTerm")
                                span(v-if="typeof contract.deliveryTerm === 'object'")
                                    p.text-black1.no-mar-padd(v-if="contract.deliveryTerm.value == 0 || contract.deliveryTerm.period == '-'")  -
                                span(v-else)
                                    p.text-black1.no-mar-padd(v-if="contract.deliveryTerm == '0 -'")  -
                            
                                p.text-black1.no-mar-padd(v-if="typeof contract.deliveryTerm === 'object'")  {{ contract.deliveryTerm.value + ' ' + contract.deliveryTerm.period  || '-' }}
                                p.text-black1.no-mar-padd(v-else)  {{ contract.deliveryTerm || '-' }}
                            .col-sm-7(v-else) -
                    .col-sm-12
                        div.d-flex.justify-content-start
                            span(style=" min-width:210px;") Location : 
                            span {{ areas | capitalize }}
                    
    .col-sm-12.mb-3
        .card.custom-shadow
            .card-header.font-16 
                .row 
                    .col-sm-4 
                        span.font-16.font-weight-bold Item Detail
            .card-body
                // One time service
                table.table.table-bordered(style="min-height:100px;", v-if="contract.contractService === 'service'")
                    thead
                        tr
                            th(v-for="(header, index) in serviceHeaders", :class="{'text-left': index === 0, 'text-center': index !=0}")
                                .text-black {{header.text}}
                    tbody
                        tr(v-for="item in contractItems")
                            td.text-left {{item.itemName ? item.itemName : '-'}}
                            td.text-center {{item.newPrice || '-'}}
                            td.text-center(v-if="showVendorInputInService") {{item.vendorPrice || '-'}}
                // Recurring contract
                table.table.table-bordered(style="min-height:100px;", v-else)
                    thead
                        tr
                            th(v-for="(header, index) in computedHeaders", :class="{'text-left': index === 0, 'text-center': index !=0 }")  {{header.text}}
                    tbody
                        tr(v-for="item in contractItems")
                            td.text-left {{ item.MstItem ? item.MstItem.code : '-' }}
                            td.text-center {{ item.MstItem ? item.MstItem.name : '-' }}
                            td.text-center {{ item.MstItem ? item.MstItem.unit : '-'}}
                            td.text-center {{ item.brand ? item.brand : '-'}}
                            td.text-center(v-if="showFinalPriceColumn") {{item.finalPrice || '-'}}
                            td.text-center(v-if="!showFinalPriceColumn") {{item.newPrice || '-'}}  
                            //- td.text-center {{item.tax || '-'}}
                            //- td.text-center(v-if="!item.finalPrice") 0
                            //- td.text-center(v-else-if="!showFinalPriceColumn && item.finalPrice") {{ item.finalPrice | calculatePriceWithTax(item.tax)}}
                            td.text-center(v-if="!showFinalPriceColumn && (changePrice || showVendorPriceToAdmin)") {{item.vendorPrice}}
                            //- td.text-center(v-if="!showFinalPriceColumn && (changePrice || showVendorPriceToAdmin)") {{ item.vendorPrice | calculatePriceWithTax(item.tax)}}
    .col-sm-12.mb-3(v-if="itemsWithSpecification && itemsWithSpecification.length")
        .card.custom-shadow
            .card-header.font-16 
                .row 
                    .col-sm-4 
                        span.font-16.font-weight-bold Item Specification
            .card-body
                table.table.table-bordered(style="min-height:100px;")
                    thead
                        tr
                            th(v-for="(header, index) in itemSpecificationHeader", :class="{'text-left': index === 0, 'text-center': index !=0 }") {{header.text}}
                    tbody
                        tr(v-for="item in itemsWithSpecification")
                            td.text-left {{ item.MstItem ? item.MstItem.code : '-' }}
                            td.text-center {{ item.MstItem ? item.MstItem.name : '-' }}
                            td.text-center(v-if="item.MstItem") {{ item.MstItem.unit | capitalize}}
                            td.text-center(v-else) -
                            //- td.text-center {{ item.brand ? item.brand : '-'}}
                            td.text-center {{item.specification || '-'}}
    .col-sm-12.mb-3
        .card.custom-shadow
            .card-header.font-16.font-weight-bold Terms & Conditions
            .card-body
                p.card-text.term-condition-text(v-if="contract.termCondition", v-html="contract.termCondition")
                p.card-text.term-condition-text.text-muted(v-else) No term and condition found for selected category
    .col-sm-12.mb-3
        .card.custom-shadow
            .card-header.font-16.font-weight-bold Annexure
            .card-body
                div(v-if="annexureAreas && annexureAreas.length")
                    div.annexure(v-for="(areas, index) in annexureAreas")
                        span.text-left-400 {{index+1}}:  
                        span.text-left {{ getAddress(areas) | capitalize }}
                .row(v-else)
                    span.ml-2 No location found.
    //- .col-sm-12.mb-3.mt-3(v-if="showVendorComment")
         .card.custom-shadow
            .card-header.font-16.font-weight-bold Vendor Comment   
            .card-body {{contract.vendorComment || 'No comment added'}}
    //- .col-sm-12.mb-3.mt-3(v-if="showBBQComment")
         .card.custom-shadow
            .card-header.font-16.font-weight-bold BBQ Comment   
            .card-body {{contract.bbqComment || 'No comment added'}}
    .col-sm-12(v-if="contract.status === 'approved'")        
        div.signature-text-custom.clearfix
            .row.mb-2 
                .col-sm-6.col-12
                    div.font-weight-bold Approved By  
                    div Barbeque Nation Hospitality Ltd
                .col-sm-6.col-12
                    div.text-right(v-if="vendor")
                        div.font-weight-bold Approved By
                        div {{vendor.companyName || '-'}}
    .col-sm-12(style="margin-top:100px;")
        p This is a system-generated pdf. Hence, it does not require any signature.
</template>

<style lang="scss" scoped>
p.term-condition-text p br {
    display: none;
}
.print-break-page {
    clear: both;
    page-break-after: always;
}
</style>

