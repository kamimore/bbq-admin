<script>
const { uniqBy } = require("lodash");
import DLayout from "@layouts/default-layout";
import ExistingContractDetail from "./components/existing-contract-detail";
import SelectCategorySection from "./subpages/select-category-section";
import SelectVendor from "./subpages/select-vendor";
import SelectItems from "./subpages/select-items";
import TermCondition from "./subpages/term-condition";
import SubmitDetail from "./subpages/submit-detail";
import contractDetails from "./subpages/contract-details";
import moment from "moment";
import { mapGetters } from "vuex";

export default {
    name: "ContractManagement",
    components: {
        DLayout,
        SelectCategorySection,
        SelectVendor,
        SelectItems,
        TermCondition,
        contractDetails,
        SubmitDetail,
        ExistingContractDetail,
    },
    data() {
        const steps = [
            {
                title: "Start Contract",
                component: "select-category-section",
            },
            {
                title: "Select Vendor",
                component: "select-vendor",
            },
            {
                title: "Contract Details",
                component: "contract-details",
            },
            {
                title: "Select Items",
                component: "select-items",
            },
            {
                title: "Terms & Preview",
                component: "term-condition",
            },
        ];
        return {
            steps,
            currentView: "select-category-section",
            active: 0,
            isVisible: true,
            mstArea: [],
            mstPaymentTerms: [],
            mstSuperCategory: [],
            mstRegion: [],
            mstCategory: [],
            mstProductGroups: [],
            mstTermCondition: [],
            allMstTermCondition: [],
            mstDeliveryTerm: [],
            mstAdvancePayment: [],
            categoryAdvancePayment: [],
            categoryDeliveryTerm: [],
            vendor: [],
            contractId: null,
            selectedContractDetail: [],
            contractItems: [],
            contractTemplates: [],
            contract: {
                superCategoryId: null,
                categoryId: null,
                areaIds: [],
                regionIds: [],
                contractItems: [],
                fromDate: null,
                toDate: null,
                paymentTermId: null,
                termCondition: null,
                advancePayment: null,
                deliveryTerm: null,
                vendor: {
                    id: null,
                    companyName: null,
                    bbqVendorId: null,
                    email: null,
                    phone: null,
                    cashLimit: null,
                },
                ContractDocuments: [],
                contractType: "recurring",
                contractService: "supply",
            },
            contractTypes: [{ name: "Recurring", value: "recurring" }, { name: "One time", value: "one_time" }],
            contractServices: [{ name: "Supply", value: "supply" }, { name: "Service", value: "service" }],
            loggedInUser: null,
        };
    },
    created() {
        this.$Progress.start();
        this.contractId = this.$route.params.id;

        this.loggedInUser = this.$store.getters["account/getUser"];

        this.getMasterData();

        if (this.contractId) {
            this.getContract();
        }
        if (this.isSourcingTeam) {
            this.contract.superCategoryId = this.loggedInUser.UserSuperCategories[0].superCategoryId;
            this.contract.regionIds = this.loggedInUser.UserRegions.filter(r => r.MstRegion).map(a => ({
                value: a.regionId,
                name: a.MstRegion.name,
            }));
        }
        if (this.isCoorporateSourcingTeam) {
            this.contract.regionIds = this.loggedInUser.UserRegions.filter(r => r.MstRegion).map(a => ({
                value: a.regionId,
                name: a.MstRegion.name,
            }));
        }
        this.$Progress.finish();
    },
    methods: {
        async getContractItems() {
            if (this.contract.contractService === "service") {
                if (this.active++ > 3) this.active = 0;
            } else {
                const contractItems = await this.$http.rawPost("contract/get", {
                    attributes: ["id", "fromDate", "toDate"],
                    where: {
                        vendorId: this.contract.vendorId,
                        fromDate: {
                            $gte: moment(this.contract.fromDate).format("YYYY-MM-DD 00:00:00+05:30"),
                        },
                        toDate: {
                            $lte: moment(this.contract.toDate).format("YYYY-MM-DD 00:00:00+05:30"),
                        },
                        status: "approved",
                    },
                    include: [
                        {
                            model: "ContractItem",
                            where: {
                                itemId: {
                                    $in: this.contract.contractItems.map(a => a.itemId),
                                },
                            },
                            include: [
                                {
                                    model: "MstItem",
                                },
                            ],
                        },
                    ],
                });
                this.contractItems = contractItems;
                if (this.contractItems && this.contractItems.length) {
                    this.$refs.save_items.open();
                } else {
                    if (this.active++ > 3) this.active = 0;
                }
            }
        },
        async getMasterData() {
            [
                this.mstArea,
                this.mstSuperCategory,
                this.mstRegion,
                this.mstProductGroups,
                this.mstCategory,
                this.mstPaymentTerms,
                this.mstDeliveryTerm,
                this.mstAdvancePayment,
                this.categoryAdvancePayment,
                this.categoryDeliveryTerm,
            ] = await Promise.all([
                this.$http.get("mst-area", {
                    attributes: {
                        exclude: ["created_at", "updated_at"],
                    },
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
                }),
                this.$http.get("mst-super-category"),
                this.$http.get("mst-region"),
                this.$http.get("mst-product-group"),
                this.$http.get("mst-category"),
                this.$http.get("mst-payment-term", {
                    where: {
                        isActive: true,
                    },
                }),
                this.$http.get("mst-delivery-term", {
                    where: {
                        isDeleted: false,
                    },
                }),
                this.$http.get("mst-advance-payment", {
                    where: {
                        isDeleted: false,
                    },
                }),
                this.$http.get("category-advance-payment", {
                    attributes: ["subCategoryId"],
                }),
                this.$http.get("category-delivery-term", {
                    attributes: ["subCategoryId"],
                }),
            ]);
        },
        async getContract() {
            const data = await this.$http.get("contract", {
                where: {
                    id: this.contractId,
                },
                include: [
                    {
                        model: "ContractArea",
                        include: [
                            {
                                model: "MstArea",
                                include: [
                                    {
                                        model: "MstRegion",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: "Vendor",
                        include: [
                            {
                                model: "VendorLocation",
                            },
                        ],
                    },
                    {
                        model: "ContractCategory",
                        include: [
                            {
                                model: "MstCategory",
                            },
                        ],
                    },
                    {
                        model: "ContractItem",
                        include: [
                            {
                                model: "MstItem",
                            },
                        ],
                    },
                    {
                        model: "ContractDocument",
                    },
                    {
                        model: "ContractTemplate",
                    },
                ],
            });

            if (data && data.length) {
                const contract = data[0];

                this.contract = contract;
                this.contract.categoryId = contract.ContractCategories;

                if(this.contract.categoryId && this.contract.categoryId.length) {
                    this.contract.categoryId = this.contract.categoryId.map(a => ({name: a.MstCategory.name, value: a.MstCategory.id}))
                }

                if (contract.ContractCategories.length) {
                    this.contract.superCategoryId = contract.ContractCategories[0].MstCategory.superCategoryId;
                }
                this.contract.termCondition = contract.termCondition;
                this.contract.vendor = contract.Vendor;
                this.contract.paymentTermId = this.mstPaymentTerms.filter(a => a.id === contract.paymentTermId);
                this.contract.contractItems = contract.ContractItems || [];

                this.contract.contractAreasId = contract.ContractAreas.map(a => ({
                    name: "contract-area",
                    id: a.id,
                }));

                this.contract.advancePayment = this.mstAdvancePayment.find(
                    a => a.value == this.contract.advancePayment,
                );

                const deliveryTermValue = this.contract.deliveryTerm.split(" ")[0];
                const deliveryTermPeriod = this.contract.deliveryTerm.split(" ")[1];

                this.contract.deliveryTerm = this.mstDeliveryTerm.find(
                    a => a.value == deliveryTermValue && a.period == deliveryTermPeriod,
                );

                this.contract.areaIds = contract.ContractAreas.map(a => ({ name: a.MstArea.name, value: a.areaId }));

                const uniqRegions = this.$lodash.uniqBy(contract.ContractAreas, "MstArea.regionId");
                this.contract.regionIds = uniqRegions.map(a => ({
                    name: a.MstArea.MstRegion.name,
                    value: a.MstArea.regionId,
                }));
            }
        },
        async createOrUpdateContract(status) {
            Object.assign(this.contract, {
                vendorId: this.contract.vendor.id,
                createdBy: this.$store.getters["account/getUserId"],
                status,
            });

            this.contract.advancePayment = this.contract.advancePayment ? this.contract.advancePayment.value : null;
            this.contract.deliveryTerm = this.contract.deliveryTerm
                ? `${this.contract.deliveryTerm.value} ${this.contract.deliveryTerm.period}`
                : "";

            const result = await this.$http.updateOrCreate("contract", this.contract);

            if (result && result.id) {
                this.contractId = result.id;

                const newItems = this.contract.contractItems.map(c => ({
                    ...c,
                    ...{ contractId: result.id, finalPrice: c.newPrice },
                }));

                const newAreas = this.contract.areaIds.map(el => ({ contractId: result.id, areaId: el.value }));

                const newContractCategories = this.contract.categoryId.map(el => ({
                    contractId: result.id,
                    categoryId: el.value,
                }));

                const newDocuments = this.contract.ContractDocuments.map(c => ({
                    contractId: result.id,
                    userId: this.loggedInUser.id,
                    belongsTo: c.belongsTo,
                    comment: c.comment,
                    fileName: c.fileName,
                    fileUrl: c.fileUrl,
                    type: c.type,
                }));

                await Promise.all([
                    this.$http.bulkDelete("contract-item", this.contract.contractItems),
                    this.$http.bulkDelete("contract-area", this.contract.ContractAreas),
                    this.$http.bulkDelete("contract-category", this.contract.ContractCategories),
                    this.$http.bulkDelete("contract-document", this.contract.ContractDocuments),
                    this.$http.bulkCreate("contract-document", newDocuments),
                    this.$http.bulkCreate("contract-area", newAreas),
                    this.$http.bulkCreate("contract-item", newItems),
                    this.$http.bulkCreate("contract-category", newContractCategories),
                    this.createOrUpdateContractTemplate(),
                ]);
            }

            let message = "Contract successfully saved";

            if (status === "sent_to_vendor") message = "Sent to vendor for approval";

            this.$utility.showSucessMessage(message);

            this.$utility.goToPage("contract.history");
        },

        async createOrUpdateContractTemplate() {
            if (this.contractId) {
                if (this.contract.ContractTemplates && this.contract.ContractTemplates.length) {
                    this.contract.ContractTemplates = this.contract.ContractTemplates.map(a => {
                        return {
                            ...a,
                            contractId: this.contractId,
                        };
                    });
                    await Promise.all([
                        this.$http.bulkDelete("contract-template", this.contract.ContractTemplates.filter(el => el.id)),
                        this.$http.bulkCreate(
                            "contract-template",
                            this.contract.ContractTemplates.filter(el => !el.id),
                        ),
                    ]);
                }
            }
        },
        next() {
            if (this.steps[this.active].component === "select-category-section") {
                if (
                    this.contract.areaIds &&
                    this.contract.areaIds.length &&
                    this.contract.categoryId &&
                    this.contract.superCategoryId &&
                    this.contract.regionIds &&
                    this.contract.regionIds.length &&
                    this.contract.contractType &&
                    this.contract.contractService
                ) {
                    if (this.active++ > 3) this.active = 0;
                } else {
                    this.$utility.showErrorMessage("Please fill all the required fields");
                }
            } else if (this.steps[this.active].component === "select-vendor") {
                if (this.contract.vendor && this.contract.vendor.id && this.contract.vendor.companyName) {
                    if (this.active++ > 3) this.active = 0;
                } else {
                    this.$utility.showErrorMessage("A Vendor must be selected");
                }
            } else if (this.steps[this.active].component === "contract-details") {
                if (this.contract && !this.contract.paymentTermId)
                    return this.$utility.showErrorMessage("Payment term must be selected");

                if ((this.contract && !this.contract.fromDate) || !this.contract.toDate)
                    return this.$utility.showErrorMessage("Contract date must be selected");

                if (this.showDeliveryTerm && !this.contract.deliveryTerm)
                    return this.$utility.showErrorMessage("Delivery Term is mandatory");

                if (this.showAdvancePayment && !this.contract.advancePayment)
                    return this.$utility.showErrorMessage("Advance Payment is mandatory");

                if (this.contract && this.contract.areaIds && !this.contract.areaIds.length)
                    return this.$utility.showErrorMessage("Location is mandatory");

                if (this.active++ > 3) this.active = 0;
            } else if (this.steps[this.active].component === "select-items") {
                if (this.contract.contractService === "service") {
                    const contractSum = this.$lodash.sumBy(this.contract.contractItems, o => parseFloat(o.newPrice));
                    const parsedCashLimit = parseFloat(this.contract.vendor.cashLimit);

                    if (parsedCashLimit > 0 && contractSum > parsedCashLimit) {
                        return this.$utility.showErrorMessage("Cash limit exceeded!");
                    }
                }

                if (this.contract.contractItems && this.contract.contractItems.length) {
                    const isCostNull = this.contract.contractItems.find(a => !a.newPrice);
                    const isNegativeCost = this.contract.contractItems.find(a => a.newPrice < 0);

                    if (isCostNull) return this.$utility.showErrorMessage("Please enter new purchase price");
                    if (isNegativeCost) return this.$utility.showErrorMessage("Price can not be negative");

                    this.getContractItems();
                } else {
                    this.$utility.showErrorMessage("Contract items are mendatory.");
                }
            }
        },
        overlapHandler(handle) {
            if (handle === "continue") {
                if (this.active++ < 0) this.active = 0;
                this.$refs.save_items.close();
            } else {
                this.$refs.save_items.close();
            }
        },
        previous() {
            if (this.active-- < 0) this.active = 0;
        },
        gotoDetails({ contract, vendor }) {
            this.contract.vendor = vendor;
            this.contract.termCondition = contract.termCondition;
            if(contract.ContractCategories && contract.ContractCategories.length) {
                this.contract.superCategoryId = contract.ContractCategories[0].MstCategory.superCategoryId;
            }
            this.contract.categoryId = contract.ContractCategories;
            this.contract.fromDate = contract.fromDate;
            this.contract.toDate = contract.toDate;
            this.contract.contractItems = uniqBy(contract.ContractItems, "itemId");
            this.contract.ContractAreas = contract.ContractAreas;
            this.contract.regionIds = [];

            for (const area of contract.ContractAreas) {
                const region = this.mstRegion.find(r => r.id === area.MstArea.regionId);
                this.contract.regionIds.push({ name: region.name, value: region.id });
            }

            this.contract.areaIds = contract.ContractAreas.map(a => ({ value: a.areaId, name: a.MstArea.name }));
            this.isVisible = true;
            this.active = 2;
        },
        showButton(show) {
            this.isVisible = show;
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor", "isMDM", "isSourcingTeam", "isCoorporateSourcingTeam"]),
        showAdvancePayment() {
            const advancePaymentIds = this.categoryAdvancePayment.map(a => a.subCategoryId);
            return advancePaymentIds.includes(+this.contract.categoryId);
        },
        showDeliveryTerm() {
            const deliveryTermIds = this.categoryDeliveryTerm.map(a => a.subCategoryId);
            return deliveryTermIds.includes(+this.contract.categoryId);
        },
        currentProp() {
            switch (this.steps[this.active].component) {
                case "select-category-section":
                    return {
                        mstArea: this.mstArea,
                        mstSuperCategory: this.mstSuperCategory,
                        mstRegion: this.mstRegion,
                        mstCategory: this.mstCategory,
                        contract: this.contract,
                        contractTypes: this.contractTypes,
                        contractServices: this.contractServices,
                        loggedInUser: this.loggedInUser,
                    };
                case "select-vendor":
                    return {
                        contract: this.contract,
                        mstArea: this.mstArea,
                    };
                case "contract-details":
                    return {
                        mstArea: this.mstArea,
                        contract: this.contract,
                        paymentTerms: this.mstPaymentTerms,
                        mstDeliveryTerm: this.mstDeliveryTerm,
                        mstAdvancePayment: this.mstAdvancePayment,
                        categoryAdvancePayment: this.categoryAdvancePayment,
                        categoryDeliveryTerm: this.categoryDeliveryTerm,
                    };
                case "select-items":
                    return {
                        contract: this.contract,
                    };
                case "term-condition":
                    return {
                        mstSuperCategory: this.mstSuperCategory,
                        contract: this.contract,
                        categoryAdvancePayment: this.categoryAdvancePayment,
                        categoryDeliveryTerm: this.categoryDeliveryTerm,
                        mstArea: this.mstArea,
                    };
                default:
                    return {};
            }
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        .custom-shadow
            .bg-white.que-category-border.p-3.contract-tabs
                .row
                    .col-md-12
                        el-steps.new1(
                            :active="active",
                            finish-status="success"
                        )
                            el-step(
                                v-for="step in steps",
                                :key="step.component",
                                :title="step.title"
                            )
                    .col-md-12
                        //- keep-alive
                        component.text-barbique(
                            v-bind="currentProp",
                            :is="steps[active].component",
                            @contractDetail="gotoDetails"
                            @currentTab="showButton",
                            @previous="previous",
                            @next="next",
                            @save="createOrUpdateContract",
                        )
                    .col-md-12.mt-3.text-right(v-if="isVisible")
                        button.btn.btn-primary.bbq-previous-button.mr-3(v-if="active!=0", @click="previous()") Previous
                        button.btn.btn-primary.bbq-next-button(v-if="active!=4",@click="next()") Next
            sweet-modal.sav-it(
                ref="save_items",
                width="60%",
                overlay-theme="dark",
            )
                existing-contract-detail(
                    :contractItems="contractItems"
                    @overlapHandler="overlapHandler"
                )
</template>

<style lang="scss"></style>
