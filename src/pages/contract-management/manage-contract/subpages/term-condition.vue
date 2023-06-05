<script>
import ViewContractDetail from "../components/view-contract-detail";
import SpecialTermModal from "../components/special-term-modal";
import UploadedFilesList from "@pages/vendor-management/vendor-profile/components/uploaded-files-list";
import UploadDocument from "@pages/vendor-management/vendor-profile/components/upload-document";

export default {
    name: "TermCondition",
    components: {
        ViewContractDetail,
        UploadedFilesList,
        UploadDocument,
        SpecialTermModal,
    },
    props: {
        contract: {
            type: Object,
            default: () => {},
        },
        mstSuperCategory: {
            type: Array,
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
        mstArea: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            contractId: null,
            mstTermCondition: [],
            specialTermCondition: [],
            allMstTermCondition: [],
            selectedSpecialTerms: [],
            selectedSpecialTermIds: [],
        };
    },
    async created() {
        this.$Progress.start();

        [this.mstTermCondition, this.specialTermCondition] = await Promise.all([
            this.getTermsAndCondition(),
            this.getSpecialTermCondition(),
        ]);

        if (this.contract && this.contract.id) {
            this.selectedSpecialTerms = await this.getSelectedSpecialTermCondition();
        }

        this.setTerms();

        this.$Progress.finish();
    },
    methods: {
        getTermsAndCondition() {
            return this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: 0,
                },
                include: [
                    {
                        model: "TermCondition",
                        where: {
                            isDeleted: false,
                            isSpecial: false,
                        },
                        include: [
                            {
                                model: "TermCondition",
                                where: {
                                    isDeleted: false,
                                },
                            },
                            {
                                model: "CategoryTermCondition",
                                where: {
                                    subCategoryId: this.contract.categoryId.map(a => a.value),
                                },
                            },
                        ],
                    },
                ],
            });
        },
        getSpecialTermCondition() {
            return this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: 0,
                },
                include: [
                    {
                        model: "TermCondition",
                        where: {
                            isDeleted: false,
                            isSpecial: true,
                        },
                        include: [
                            {
                                model: "TermCondition",
                                where: {
                                    isDeleted: false,
                                },
                            },
                            {
                                model: "CategoryTermCondition",
                                where: {
                                    subCategoryId: this.contract.categoryId.map(a => a.value),
                                },
                            },
                        ],
                    },
                ],
            });
        },
        getSelectedSpecialTermCondition() {
            const itemIds = this.contract.ContractTemplates.map(a => a.templateId);

            return this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: 0,
                },
                include: [
                    {
                        model: "TermCondition",
                        where: {
                            isDeleted: false,
                            isSpecial: true,
                        },
                        include: [
                            {
                                model: "TermCondition",
                                where: {
                                    isDeleted: false,
                                    id: {
                                        $in: itemIds,
                                    },
                                },
                            },
                            {
                                model: "CategoryTermCondition",
                                where: {
                                    subCategoryId: this.contract.categoryId.map(a => a.value),
                                },
                            },
                        ],
                    },
                ],
            });
        },
        async saveContract(status) {
            try {
                if (!this.contract.termCondition && status != "draft") {
                    return this.$utility.showErrorMessage("Terms & Conditions are required");
                }

                if (status === "sent_to_vendor" && this.contract.contractService !== "service") {
                    this.$Progress.start();

                    // const result = await this.$utility.contractERPValidation(this.contract, this.mstArea);

                    const payload = this.$utility.contractERPValidation(this.contract, this.mstArea);

                    await this.$http.rawPost("validate/contract", payload);

                    this.$Progress.finish();

                    // const response = result.data;

                    // if (response.Message != "Validated") {
                    //     if (response.Message) this.$utility.showErrorMessage(response.Message);
                    //     return null;
                    // }
                }

                this.contract.paymentTermId = this.contract.paymentTermId ? this.contract.paymentTermId.id : null;

                this.$emit("save", status);
            } catch(err){
                this.$utility.showErrorMessage(err.message);
            }
        },
        setTerms() {
            this.allMstTermCondition = [];
            this.contract.termCondition = null;
            let text = "";

            const concatedTerms = [...this.mstTermCondition, ...this.selectedSpecialTerms];

            this.allMstTermCondition = Object.assign([], concatedTerms);

            for (const item of this.allMstTermCondition) {
                if (item.TermConditions.length > 1) text += `${item.content}<br>`;

                for (const subItem of item.TermConditions) {
                    if (item.TermConditions.length > 1) text += `${subItem.content}`;

                    const sortedItems = this.$lodash.sortBy(subItem.TermConditions, ["id"]);

                    for (const subSubItem of sortedItems) {
                        text += `${subSubItem.content}`;
                    }
                }
            }

            this.mstTermCondition.forEach(element => {
                if (this.contract.ContractTemplates && this.contract.ContractTemplates.length) {
                    this.contract.ContractTemplates.push({ templateId: element.id });
                } else {
                    this.contract.ContractTemplates = [{ templateId: element.id }];
                }
            });

            this.selectedSpecialTermIds.forEach(id => {
                if (this.contract.ContractTemplates && this.contract.ContractTemplates.length) {
                    this.contract.ContractTemplates.push({ templateId: id });
                } else {
                    this.contract.ContractTemplates = [{ templateId: id }];
                }
            });

            this.contract.termCondition = text;
        },
        saveDocument(data) {
            if (this.contract.ContractDocuments) {
                this.contract.ContractDocuments.push(data);
            }
        },
        downloadAsPDF() {
            this.$htmlToPaper("contractPDF", f => f);
        },
        addSpecialTerms(terms = [], termIds = []) {
            console.log({ terms, termIds });
            this.selectedSpecialTerms = terms;
            this.selectedSpecialTermIds = termIds;
            this.setTerms();
            this.$refs.special_term_modal.close();
        },
    },
    computed: {
        superCategory() {
            if (this.mstSuperCategory && this.mstSuperCategory.length) {
                return this.mstSuperCategory.find(a => a.id == this.contract.superCategoryId);
            }
            return {};
        },
        areas() {
            if (this.contract.areaIds && this.contract.areaIds.length) {
                return this.contract.areaIds.map(a => a.name).join(", ");
            }
            return "";
        },
    },
};
</script>

<template lang="pug">
.col-md-12.mt-3.grid-margin.stretch-card.no-mar-pad
    .category-p.cat-templete.top-border-1
        .row
            .col-md-8
                h4.card-title.font-weight-bold Terms and Conditions
            .col-md-4.mb-2
                button.btn.bbq-btn-primary.mr-1.pull-right(
                    type='button', 
                    @click="$refs.special_term_modal.open()"
                ) Add/Edit Special Terms
        .row(v-if="allMstTermCondition && !allMstTermCondition.length")
           .col-sm-12
                .form-group
                    span.text-muted No term and condition found for selected category
        .row(v-else, v-for="item in allMstTermCondition", :key="item.id")
            .col-sm-12
                .custom-control.custom-check.width-100
                    .border-p.mb-3
                        .card-header {{item.content}}
                        .card-body.templete-terms
                            div.temp-temp(v-for="subItem in item.TermConditions", :key="subItem.id")
                                p.font-weight-bold(v-if="item.TermConditions.length > 1") {{subItem.content}}
                                p.font-weight-bold.mb-0(v-if="item.TermConditions.length > 1")
                                .renderHtml.temp-box(v-for="subsubItem in subItem.TermConditions", :key="subsubItem.id", v-html="subsubItem.content")
        //.row
            .col-sm-12
                upload-document(
                    belongsTo="sourcing",
                    :showUnderlineHeading="true",
                    @save="saveDocument"
                )
                uploaded-files-list(
                    type="contract",
                    :files="contract.ContractDocuments",
                )
            //- .col-sm-12
                form-field(
                    v-model="contract.bbqComment",
                    attribute="Comment",
                    placeholder="Enter your comment"
                    inputType="textarea",
                    :required="false",
                )
        .form-group.text-center.pb-2.pt-4
            button.btn.btn-primary.mr-1.bbq-green-button(type='button', @click="saveContract('sent_to_vendor')") Send to Vendor
            button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="saveContract('draft')") Save as draft
            button.btn.btn-primary.mr-1(type='button', @click="$refs.view_contract.open()") Preview
    sweet-modal.view-contract(
        ref="special_term_modal",
        width="100%",
        overlay-theme="dark",
    )
        special-term-modal(
            :contract="contract",
            :items="specialTermCondition",
            :selectedItems="selectedSpecialTerms",
            @save="addSpecialTerms"
        )
    sweet-modal.view-contract(
        ref="view_contract",
        width="70%",
        overlay-theme="dark",
    )
        view-contract-detail(
            title="Preview Contract",
            :contract="contract",
            :contractItems="contract.contractItems",
            :vendor="contract.vendor",
            :supercategory="superCategory",
            :areas="areas",
            :showLogo="true",
            :categoryAdvancePayment="categoryAdvancePayment",
            :categoryDeliveryTerm="categoryDeliveryTerm",
            :showUplodedFiles="false",
            :allAreas="mstArea"
        )
            //- button.btn.btn-primary.mr-1.bbq-green-button(type='button', @click="saveContract('sent_to_vendor')") Send to Vendor
            //- button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="saveContract('draft')") Save 
            .btn.btn-primary.mr-1.pdf-button(@click="downloadAsPDF") Download as PDF 
</template>
<style lang="scss">
.card.bg-light {
    color: #000;
}
.card.bg-light .card-header {
    font-weight: 500;
    font-size: 16px;
}
.templete-full-view .card.bg-light {
    max-width: 100%;
    height: 300px;
}
.templete-full-view {
    padding: 0px 30px 0px 37px;
}
.templete-full-view .card .card-body {
    overflow-y: scroll;
}
label.term-cond {
    font-size: 14px !important;
}
.templete-full-view {
    padding: 0px 20px 0px 20px;
}
.temp-box {
    // max-width: 30%;
    width: 100%;
}
.temp-box .card {
    // height: 150px;
    // max-width: 275px;
    width: 100%;
}
.temp-box .el-checkbox__inner {
    display: block;
    position: absolute;
    left: -12px;
}
.custom-check span.el-checkbox__label {
    // width: 275px;
}
.temp-box span.el-checkbox__label {
    width: 100%;
}
.custom-check.width-100 {
    padding-left: 0 !important;
    width: 100%;
}
.custom-check .el-checkbox-group label {
    display: table;
    width: 100%;
}
.custom-check .el-checkbox-group label span {
    display: table-cell;
    vertical-align: top;
}
.el-checkbox.temp-box {
    margin-right: 0px;
    margin-bottom: 10px !important;
}
img.pdf-img.view-con {
    width: 16%;
    display: inline-block;
    margin-top: 0px;
    cursor: pointer;
}
</style>
