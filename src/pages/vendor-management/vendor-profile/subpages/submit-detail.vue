<script>
import { mapGetters } from "vuex";
import ApproveCategoryModal from "../components/approve-category-modal";

export default {
    name: "SubmitDetails",
    components: {
        ApproveCategoryModal,
    },
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        vendorLocations: {
            type: Array,
            default: () => [],
        },
        vendorData: {
            type: Object,
            default: () => {},
        },
        vendorStatus: {
            type: String,
            default: "draft", // draft, pending, rejected, approved_by_mdm, rejected_by_sourcing_team, rejected_by_mdm
        },
        approvalRequests: {
            type: Array,
            default: () => [],
        },
        mstStates: {
            type: Array,
            default: () => [],
        },
        mstSuperCategories: {
            type: Array,
            default: () => [],
        },
        currentTab: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            defaultStatus: "approved",
            userId: this.$store.getters["account/getUserId"],
            editProfile: false,
        };
    },
    methods: {
        async confirmSubmit(status) {
            try {
                const { isValid, message: msg, type, component } = this.validateVendor();

                if (!isValid) {
                    if (component != this.currentTab) this.$emit("setCurrentTab", component);
                    if (type !== "bank") this.$scrollTo("#location-detail");
                    return this.$utility.showErrorMessage(msg);
                }

                this.vendor.VendorData = this.vendorData.vendorAreas;

                this.$store.dispatch("loader/updateLoader", true);
                this.$Progress.start();

                this.vendor.VendorLocations = this.vendorLocations;

                const payload = this.$utility.vendorERPValidation(this.vendor, this.mstStates);

                await this.$http.rawPost("validate/vendor", payload);

                this.$store.dispatch("loader/updateLoader", false);

                this.$Progress.finish();

                // const response = result.data;

                // if (response.MessageType === "failure") {
                //     let ERPmessage = "";

                //     if (response.VendorMessage) ERPmessage = response.VendorMessage;
                //     else if (response.VendorAddressMessage) ERPmessage = response.VendorAddressMessage;
                //     else if (response.VendorBankMessage) ERPmessage = response.VendorBankMessage;

                //     if (ERPmessage) this.$utility.showErrorMessage(ERPmessage);

                //     return null;
                // }

                const title = "Submit Profile";
                const message = "Are you sure you want to submit the profile ?";

                this.$confirm(message, title, {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    type: "success",
                    showCancelButton: true,
                    lockScroll: false,
                }).then(async () => {
                    this.$emit("action", status);
                });
            } catch(err){
                this.$utility.showErrorMessage(err.message);
            }
        },
        async updateStatus(status) {
           // console.log('in submit updatestatus');
            try {
                if (!this.isMDM) {
                    if (this.vendor && !this.vendor.paymentTermId) return this.$message.error("Payment term is mandatory");
                    if (this.vendor && !this.vendor.vendorTypeId) return this.$message.error("Vendor type is mandatory");
                   

                    this.defaultStatus = status;
                    this.$refs.approve_category_modal.open();
                } else {
                    let panNumberMsg = '';

                    if (status !== "rejected") {
                        let { isValid, message: msg } = this.validateVendor();

                        if (!isValid) {
                            this.$scrollTo("#location-detail");
                            return this.$utility.showErrorMessage(msg);
                        }

                        this.$store.dispatch("loader/updateLoader", true);

                        const payload = this.$utility.vendorERPValidation(this.vendor, this.mstStates);

                        await this.$http.rawPost("validate/vendor", payload);

                        this.$store.dispatch("loader/updateLoader", false);

                        // const errorMessages = result.data;

                        // if (errorMessages.MessageType == "failure") {
                        //     let ERPmessage;
                        //     if (errorMessages.VendorAddressMessage) ERPmessage = errorMessages.VendorAddressMessage;
                        //     else if (errorMessages.VendorBankMessage) ERPmessage = errorMessages.VendorBankMessage;
                        //     else ERPmessage = errorMessages.VendorMessage;

                        //     return this.$utility.showErrorMessage(ERPmessage);
                        // }

                        panNumberMsg = await this.checkPanNumber();
                    }

                    let title = "Approve Vendor";
                    let message = `${panNumberMsg}Are you sure you want to approve the vendor ?`;

                    if (status === "rejected") {
                        title = "Reject Vendor";
                        message = "Are you sure you want to reject the vendor ?";
                    }

                    this.$prompt(message, title, {
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        showCancelButton: true,
                        inputPlaceholder: "Please enter comment",
                        inputErrorMessage: "Comment is required",
                        inputValidator: v => status === "approved" || !!v,
                        lockScroll: false,
                    }).then(async ({ value }) => {
                        if (this.isMDM) {
                            let sourcingType = "MDM";
                            this.$emit("updateStatus", { status, comment: value, sourcingType});
                        } else if (this.isSourcingHead) {
                            let sourcingType = "SourcingHead";
                            this.$emit("updateStatus", { status, comment: value, sourcingType });
                        }
                    });
                   // console.log("end of submit update");
                }
            } catch(err){
                this.$utility.showErrorMessage(err.message);
            }
        },
        async checkPanNumber() {
            const panNumbers = this.vendorLocations.map(l => l.panNumber);

            if (panNumbers && !panNumbers.length) return;

            const result = await this.$http.get("vendor-location", {
                where: {
                    vendorId: {
                        $ne: this.vendor.id,
                    },
                    panNumber: {
                        $in: panNumbers,
                    },
                    isDeleted: false,
                },
                limit: 5,
                attributes: ["id"],
                include: [{ model: "Vendor", attributes: ["id", "companyName", "bbqVendorId"] }],
            });

            if (result && !result.length) return;

            const names = result.map(v => `${v.Vendor.companyName} (${v.Vendor.bbqVendorId})`);

            // this.$utility.showErrorMessage(`PAN Number already exists for ${names.join(', ')}`);

            return `PAN Number already exists for ${names.join(', ')}. `;
        },
        validateVendor() {
            let data = this.$utility.validateVendor({
                vendor: this.vendor,
                vendorLocations: this.vendorLocations.filter(l => l.isDeleted == false),
                softValidate: this.isInternalVendor,
                categories: this.vendorData.vendorSuperCategories,
                supplyLocations: this.vendorData.vendorAreas,
                isMDM: this.isMDM,
                isSourcingHead: this.SourcingHead
            });

            if (!data.isValid) return data;

            return {
                isValid: true,
                message: "",
            };
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor", "isSourcingHead", "isMDM", "isSourcingTeam", "isCoorporateSourcingTeam", "isSourcingRole"]),
        showSubmitButton() {
            if (this.isInternalVendor && this.isSourcingRole) return true;
            if (
                this.isVendor &&
                ["draft"].includes(this.vendorStatus) &&
                this.currentTab === "location-detail-section"
            ) {
                return true;
            }
            if (
                this.isVendor &&
                ["approved_by_mdm", "rejected_by_sourcing", "rejected_by_mdm", "approved_by_sourcing_head", "rejected_by_sourcing_head"].includes(this.vendor.status) &&
                this.editProfile
            ) {
                return true;
            }
            return false;
        },
        showSaveAndExit() {
            // if (this.isInternalVendor) return true;
            if (this.isVendor && ["draft"].includes(this.vendorStatus)) {
                return true;
            }
            if (this.isVendor && this.editProfile && ["approved_by_sourcing_head", "rejected_by_sourcing_head", "approved_by_mdm", "rejected_by_mdm"].includes(this.vendorStatus)) {
                return true;
            }
            return false;
        },
        showApproveButton() {
            if ((this.isSourcingTeam || this.isCoorporateSourcingTeam) && this.vendorStatus === "pending") {
                const approvalRequest = this.approvalRequests.find(
                    u => u.status === "pending" && u.assignedToId === this.userId,
                );
                return approvalRequest || false;
            } else if (this.isSourcingHead && this.vendorStatus === "approved_by_sourcing") {
                const approvalRequest = this.approvalRequests.find(
                    u => u.status === "pending" && u.assignedToId === this.userId,
                );
                return approvalRequest || false;
            } else if (this.isMDM && this.vendorStatus === ("approved_by_sourcing_head") || ("approved_by_sourcing")) {
                const isApproved = this.approvalRequests.find(
                    u => u.status === "pending" && u.assignedToId === this.userId,
                );
                return isApproved;
            }
            return false;
        },
        showRejectButton() {
            return this.showApproveButton;
        },
        showCancelButton() {
            return this.showSubmitButton || this.showApproveButton || this.showRejectButton;
        },
        showAssignToOtherButton() {
            return this.showApproveButton && !this.isMDM && !this.isSourcingHead;
        },
        isInternalVendor() {
            return this.vendor && this.vendor.type === "internal" && this.vendorStatus === "draft";
        },
        showEditButton() {
            return (
                this.isVendor &&
                ["approved_by_mdm", "rejected_by_sourcing", "rejected_by_mdm", "approved_by_sourcing_head", "rejected_by_sourcing_head"].includes(this.vendorStatus)
            );
        },
    },
};
</script>

<template lang="pug">
.text-right.pt-3
    button.btn.btn-success.ml-2.approve.mt-1(
        v-if="showApproveButton",
        @click="updateStatus('approved')",
    ) Approve
    button.btn.btn-danger.ml-2.mt-1(
        v-if="showRejectButton",
        @click="updateStatus('rejected')",
    ) Reject
    button.btn.btn-info.ml-2.approve.mt-1(
        v-if="showAssignToOtherButton",
        @click="$emit('openAssignUserModal')"
    ) Assign to Other
    button.btn.bbq-btn-primary.ml-2.mt-1(
        v-if="!editProfile && showEditButton", 
        @click="$emit('editProfile'); editProfile = true",
    ) Edit
    button.btn.btn-success.ml-2.mt-1(
        v-if="showSubmitButton", 
        @click="confirmSubmit('submit')",
    ) Send for further processing
    button.btn.bbq-btn-primary.ml-2.mt-1(
        v-if="editProfile && showEditButton", 
        @click="$emit('editProfile'); editProfile = false"
    ) Cancel
    button.btn.btn-secondary.ml-2.mt-1(
        v-if="showSaveAndExit",
        @click="$emit('action', 'save')"
    ) Save as draft
    //- button.btn.bbq-btn-primary.mr-2(
    //-     v-if="showCancelButton", 
    //-     @click="$utility.goToPage('contract.history')"
    //- ) Back
    sweet-modal(
        ref="approve_category_modal",
        width="35%",
        overlay-theme="dark",
    ) 
        approve-category-modal(
            :approvalRequests="approvalRequests",
            :defaultStatus="defaultStatus",
            @action="$refs.approve_category_modal.close();$emit('approveRequests', $event)"
        )
</template>
