<script>
import DLayout from "@layouts/default-layout";
import { mapGetters } from "vuex";
import ViewContractDetail from "../manage-contract/components/view-contract-detail";

export default {
    name: "ViewContract",
    components: {
        DLayout,
        ViewContractDetail,
    },
    data() {
        return {
            contract: {},
            contractId: null,
            createdBy: null,
            showPrice: false,
            loggedInUser: this.$store.getters["account/getUser"],
            categoryAdvancePayment: [],
            categoryDeliveryTerm: [],
        };
    },
    async created() {
        this.$Progress.start();

        this.contractId = this.$route.params.id;
        const user = this.$store.getters["account/getUser"];
        this.createdBy = user.id;
        await this.getData();
        this.getCategoryDetails();

        this.$Progress.finish();
    },
    methods: {
        async changeRequest(status) {
            const data = {
                status: status,
            };
            let message = "Contract successfully approved";

            if (status === "rejected_by_sourcing") {
                Object.assign(data, {
                    bbqComment: this.contract.bbqComment,
                });
                message = "Contract changes rejected";
                // this.$message.warning("Contract changes rejected.");
            }

            if (status === "approved" && this.isVendor && this.showPrice) {
                for (const items of this.contract.ContractItems) {
                    await this.$http.updateById("contract-item", items.id, {
                        newPrice: items.vendorPrice,
                        finalPrice: items.vendorPrice,
                    });
                }
                // this.$utility.showSucessMessage("Contract successfully approved");
            }

            if (this.contract && this.contract.bbqComment)
                Object.assign(data, {
                    bbqComment: this.contract.bbqComment,
                });

            if (this.contract && this.contract.bbqComment)
                Object.assign(data, {
                    bbqComment: this.contract.bbqComment,
                });

            await this.$http.updateById("contract", this.contractId, data);
            this.$message.success(message);
            this.$utility.goToPage("contract.history");
        },
        async getData() {
            if (this.contractId) {
                let result = await this.$http.get("contract", {
                    where: {
                        id: this.contractId,
                    },
                    include: [
                        {
                            model: "User",
                        },
                        {
                            model: "ContractCategory",
                            include: [
                                {
                                    model: "MstCategory",
                                    include: [
                                        {
                                            model: "MstSuperCategory",
                                        },
                                    ],
                                },
                            ],
                        },
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
                            model: "MstPaymentTerm",
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
                            model: "ContractApprovalRequest",
                            include: [
                                {
                                    model: "User",
                                    attributes: ["fullName", "userName"],
                                },
                            ],
                        },
                    ],
                });

                result = this.$lodash.first(result);

                if (this.isVendor && result && result.status === "sent_to_vendor") {
                    const isEmpty = result.ContractItems.find(c => c.vendorPrice == "0.00");

                    if (isEmpty) {
                        result.ContractItems = result.ContractItems.map(i => ({
                            ...i,
                            ...{ vendorPrice: i.newPrice },
                        }));
                    }
                }

                this.contract = result;
            }
        },

        async getCategoryDetails() {
            [this.categoryAdvancePayment, this.categoryDeliveryTerm] = await Promise.all([
                this.$http.get("category-advance-payment", {
                    attributes: ["subCategoryId"],
                }),
                this.$http.get("category-delivery-term", {
                    attributes: ["subCategoryId"],
                }),
            ]);
        },
        changeRoute() {
            if (this.isVendor) return this.$utility.goToPage("vendor.contract");

            return this.$utility.goToPage("contract.history");
        },
        async sendToVendor() {
            try {
                this.$Progress.start();

                const payload = this.$utility.contractERPValidation(this.contract);

                await this.$http.rawPost("validate/contract", payload);

                this.$Progress.finish();

                // const response = result.data;

                // if (response.Message != "Validated") {
                //     if (response.Message) this.$utility.showErrorMessage(response.Message);

                //     return null;
                // }

                this.contract.status = "sent_to_vendor";
                if (this.contract.isContractOverrided) {
                    this.contract.overrideStatus = "";
                    this.contract.isContractOverrided = false;
                }

                await this.$http.updateOrCreate("contract", this.contract);

                this.$utility.showSucessMessage("Successfully sent contract to vendor for approval");

                this.$utility.goToPage("contract.history");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async updateContract(status, comment = "") {
		
						 // contract cancel
            try {
                let query = {};
                query.contractId = this.contractId;
                console.log('contract id');
                console.log(this.contractId);
                if (status === "contract_cancelled") {
                    const cancelRes = await this.$http.postBBQApi(
                        `${process.env.VUE_APP_BBQ_API_HOST}/vendor_contract_cancel`,
                        query,
                    );
                    console.log('cancel result ---');
                    console.log(cancelRes.message);
                    console.log(cancelRes.messageType);

                    console.log(cancelRes);


                    // contract cancel
                    console.log('cancelRes.messageType');
                    console.log(cancelRes.messageType);
                    if (this.isRegionalContract && this.isCoorporateSourcingTeam && cancelRes.messageType) {
                        const contractApprovalRequest = this.contract.contractApprovalRequests.find(
                            a => a.assignedToId === this.loggedInUser.id && a.status === "approved",
                        );
                        // need to change code here // rudresh
                        if (contractApprovalRequest) {
                            console.log('contractApprovalRequest status remain approve or cancelled based on your action in view-contract_index(bbq-admin)');
                            await this.$http.updateById("contract-approval-request", contractApprovalRequest.id, {
                                status: status === "contract_cancelled" ? "cancelled" : "approved",
                                reviewedDate: Date.now(),
                                comment,
                            });
                        }
                    }else{
						console.log(cancelRes.message);
						this.$utility.showErrorMessage(cancelRes.message);
						return;
					}

                   // return;
                }
            } catch (err) {
                console.log(err);
                return;
            }
		
		
		
		
            try {
                this.$Progress.start();

                if (this.contract.ContractItems && this.contract.ContractItems.length && (!(status === "contract_cancelled" || status === "sent_contract_cancel_request"))) {
                    await this.handleContractItems(status);
                }

                let showMessage = true;

                if (
                    status === "sent_to_co_sourcing" &&
                    this.contract.overrideStatus === "override_approved_by_co_sourcing"
                ) {
                    this.$utility.showSucessMessage("Contract already been approved and overrided!");
                    status = "approved";
                    showMessage = false;
                } else if (
                    status === "sent_to_co_sourcing" &&
                    this.contract.overrideStatus === "override_rejected_by_co_sourcing"
                ) {
                    this.$utility.showErrorMessage("Contract already been rejected by Co Sourcing and overrided!");
                    status = "rejected_by_co_sourcing";
                    showMessage = false;
                } else if (
                    status === "rejected_by_vendor" &&
                    this.contract.overrideStatus === "override_rejected_by_co_sourcing"
                ) {
                    this.$utility.showErrorMessage("Contract already been rejected by Co Sourcing and overrided!");
                    status = "rejected_by_vendor";
                    showMessage = false;
                } else if (
                    status === "rejected_by_vendor" &&
                    this.contract.overrideStatus === "override_approved_by_co_sourcing"
                ) {
                    this.$utility.showSucessMessage(
                        "Contract has been overrided and approved by Co Sourcing, but rejected by you!",
                    );
                    status = "rejected_by_vendor";
                    showMessage = false;
                }

                await this.$http.updateById("contract", this.contractId, {
                    status,
                    vendorComment: this.contract.vendorComment,
                });

                if (this.isRegionalContract && this.isCoorporateSourcingTeam) {
                    const contractApprovalRequest = this.contract.contractApprovalRequests.find(
                        a => a.assignedToId === this.loggedInUser.id && a.status === "pending",
                    );

                    if (contractApprovalRequest) {
                        await this.$http.updateById("contract-approval-request", contractApprovalRequest.id, {
                            status: status === "rejected_by_co_sourcing" ? "rejected" : "approved",
                            reviewedDate: Date.now(),
                            comment,
                        });
                    }
                }

                this.$Progress.finish();

                if (showMessage) {
                    this.$utility.showSucessMessage("Contract successfully updated.");
                }

                if (this.isVendor) this.$utility.goToPage("vendor.contract");
                else if (this.contract.isContractOverrided) this.$utility.goToPage("override.contract.history");
                else this.$utility.goToPage("contract.history");
            } catch (err) {
                this.$Progress.finish();
                this.$utility.showErrorMessage(err.message);
            }
        },
        async handleContractItems(status) {
            try {
                if (["approved", "sent_to_co_sourcing"].includes(status)) {
                    if (this.isVendor) {
                        this.contract.ContractItems = this.contract.ContractItems.map(c => ({
                            ...c,
                            ...{ finalPrice: c.newPrice },
                        }));
                    } else if (this.contract.status === "change_request") {
                        this.contract.ContractItems = this.contract.ContractItems.map(c => ({
                            ...c,
                            ...{ finalPrice: c.vendorPrice },
                        }));
                    }
                }

                const newDocuments = this.contract.ContractDocuments.map(c => ({
                    ...c,
                    ...{ contractId: this.contractId, userId: this.loggedInUser.id },
                }));

                await this.$http.bulkUpdateOrCreate("contract-item", this.contract.ContractItems);
                await this.$http.bulkUpdateOrCreate("contract-document", newDocuments);
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        confirmSubmit(status) {
            // if (["rejected_by_vendor", "change_request"].includes(status) && !this.contract.vendorComment)
            //     return this.$utility.showErrorMessage("Please enter the comment");

            let title = "Approve Contract";
            let message = "Are you sure you want to approve the contract ?";

            if (status === "rejected_by_vendor") {
                title = "Reject Contract";
                message = "Are you sure you want to reject the contract ?";
            } else if (status === "change_request") {
                title = "Submit Changes";
                message = "Are you sure you want to submit the changes ?";
            } else if (status === "rejected_by_co_sourcing") {
                title = "Reject Contract";
                message = "Are you sure you want to reject the contract ?";
            }else if (status === "sent_contract_cancel_request") {
                title = "Sent Contract Cancel Request";
                message = "Are you sure you want to send request for cancel this contract?";

            } else if (status === "contract_cancelled") {
                title = "Contract Cancelled";
                message = "Are you sure you want to cancel this contract?";
            }

            if (this.isRegionalContract && this.isCoorporateSourcingTeam && this.canGiveApproval || (status === 'contract_cancelled')) {
                this.$prompt(message, title, {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    showCancelButton: true,
                    inputPlaceholder: "Please enter comment",
                    inputErrorMessage: "Comment is required",
                    inputValidator: v => status === "approved" || !!v,
                    lockScroll: false,
                }).then(async ({ value }) => {
                    await this.updateContract(status, value);
                });
            } else {
                this.$confirm(message, title, {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    type: ["rejected_by_vendor", "rejected_by_sourcing"].includes(status) ? "error" : "success",
                    showCancelButton: true,
                    lockScroll: false,
                }).then(async () => {
                    await this.updateContract(status);
                });
            }
        },
        changePrice(isShow) {
            this.showPrice = isShow;
            if (!isShow) {
                this.contract.ContractItems = this.contract.ContractItems.map(i => ({
                    ...i,
                    ...{ vendorPrice: i.newPrice },
                }));
            }
        },
        downloadAsPDF() {
            this.$htmlToPaper("contractPDF", f => f);
        },
        async overrideContract() {
            try {
                await this.$http.updateById(
                    "contract",
                    this.contractId,
                    {
                        isContractOverrided: true,
                        overrideStatus: "override",
                    },
                    true,
                );

                this.$utility.goToPage("override.contract.history");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async confirmOverrideSubmit(status) {
            try {
                let title = "Approve Contract";
                let message = "Are you sure you want to approve the contract ?";

                if (status === "override_rejected_by_co_sourcing") {
                    title = "Reject Contract";
                    message = "Are you sure you want to reject the contract ?";
                }
				if (status === "contract_cancelled") {
                    title = "Cancel Contract";
                    message = "Are you sure you want to Cancel this contract ?";
                }
				

                this.$prompt(message, title, {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    showCancelButton: true,
                    inputPlaceholder: "Please enter comment",
                    inputErrorMessage: "Comment is required",
                    inputValidator: v => !!v,
                    lockScroll: false,
                }).then(async ({ value }) => {
                    this.handleOverrideChangeStatus(status, value);
                });
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async handleOverrideChangeStatus(status, comment) {
            try {
                const contractStatus = this.contract.status;

                let queryStatus = "sent_to_vendor";

                if (contractStatus === "sent_to_co_sourcing" && status === "override_approved_by_co_sourcing") {
                    queryStatus = "approved";
                } else if (contractStatus === "sent_to_co_sourcing" && status === "override_rejected_by_co_sourcing") {
                    queryStatus = "rejected_by_co_sourcing";
                } else if (contractStatus === "rejected_by_vendor" && status === "override_approved_by_co_sourcing") {
                    queryStatus = "rejected_by_vendor";
                } else {
                    queryStatus = contractStatus;
                }

                await this.$http.updateById(
                    "contract",
                    this.contractId,
                    {
                        overrideStatus: status,
                        comment,
                        status: queryStatus,
                    },
                    true,
                );

                if (status === "override_approved_by_co_sourcing" && contractStatus !== "rejected_by_vendor") {
                    await this.handleContractItems("approved");
                }

                const contractApprovalRequest = this.contract.contractApprovalRequests.find(
                    a => a.assignedToId === this.loggedInUser.id && a.status === "pending",
                );

                if (contractApprovalRequest) {
                    await this.$http.updateById("contract-approval-request", contractApprovalRequest.id, {
                        status: status === "override_rejected_by_co_sourcing" ? "rejected" : "approved",
                        reviewedDate: Date.now(),
                        comment,
                    });
                }

                this.$utility.showSucessMessage("Overridden contract sucessfully updated!");
                this.$utility.goToPage("override.contract.history");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor", "isSourcingTeam", "isSuperAdmin", "isCoorporateSourcingTeam"]),
        showApproveButton() {
            const status = this.contract.status;
            if (this.showPrice) return false;
            if (status === "sent_to_vendor" && this.isVendor) return true;
            if (status === "change_request" && this.contract.createdBy === this.loggedInUser.id) return true;

            return false;
        },
		showCancelContractRequestButton() {
            const status = this.contract.status;
            const overridestatus = this.contract.overrideStatus;
           // this.contract.overrideStatus
            console.log('showCancelContractRequestButton');
            console.log(overridestatus);
            console.log(status);
           // if (this.showPrice) return false;
            //if (status === "approved" || overridestatus === "override_approved_by_co_sourcing") return true;
			if (status === "approved") return true;
            if (!(status === "sent_contract_cancel_request" || status === "contract_cancelled") && overridestatus === "override_approved_by_co_sourcing") return true;
            if (status === "change_request" && this.contract.createdBy === this.loggedInUser.id) return true;

            return false;
        },
        showCancelContractButton() {
            const status = this.contract.status;
            console.log('can give approval :');
            console.log(this.canGiveApproval);
           // if (this.showPrice) return false;
            if (this.isCoorporateSourcingTeam && status === "sent_contract_cancel_request") return true;
          //  if (status === "change_request" && this.contract.createdBy === this.loggedInUser.id) return true;

            return false;
        },
        showRejectButton() {
            if (!this.isVendor) return false;
            if (this.showPrice) return false;
            return this.showApproveButton;
        },
        showRequestChangeButton() {
            return this.contract.status === "sent_to_vendor" && this.isVendor && this.showPrice;
            // if (this.showPrice) return true;
            // return this.showApproveButton;
        },
        showEditButton() {
            return (
                !this.isVendor &&
                this.contract.createdBy === this.loggedInUser.id &&
                ["draft", "rejected_by_vendor", "rejected_by_sourcing", "rejected_by_co_sourcing"].includes(
                    this.contract.status,
                )
            );
        },
        showSendToVendorButton() {
            if (this.isSuperAdmin) return false;
            if (this.contract.status === "change_request" && !this.isVendor) return true;
            return this.showEditButton;
        },
        showAcceptChangeButton() {
            if (this.contract.createdBy === this.createdBy && this.contract.status === "change_request") return true;
            return false;
        },
        sentToCoSourcingToVendor() {
            if (this.isSuperAdmin) return false;
            if (this.showPrice) return false;
            if (this.isRegionalContract && this.isVendor && this.contract.status === "sent_to_vendor") return true;

            return false;
        },
        sentToCoSourcingToSourcing() {
            if (this.isSuperAdmin) return false;
            if (this.isRegionalContract && this.isSourcingTeam && this.contract.status === "change_request")
                return true;
            return false;
        },
        showSentToCoSourcing() {
            if (this.sentToCoSourcingToSourcing || this.sentToCoSourcingToVendor) return false;
            return true;
        },
        showRejectButtonToCS() {
            if (this.isSuperAdmin) return false;
            if (!this.contract || !this.contract.contractApprovalRequests) return false;

            const contractApprovalAssignedTo = this.contract.contractApprovalRequests.find(
                a => a.assignedToId === this.loggedInUser.id && a.status === "pending",
            );

            if (this.contract.status === "sent_to_co_sourcing" && contractApprovalAssignedTo) return true;
            return false;
        },
        isRegionalContract() {
            return this.contract && this.contract.User && this.contract.User.sourcingType === "sourcing";
        },
        canGiveApproval() {
            if (this.contract && !this.contract.contractApprovalRequests.length) return false;

            const req = this.contract.contractApprovalRequests.find(
                a => a.assignedToId === this.loggedInUser.id && a.status === "pending",
            );
            return req;
        },
        showOverrideContract() {
            if (
                this.isSourcingTeam &&
                !this.contract.isContractOverrided &&
                this.contract.status === "sent_to_vendor" &&
                this.createdBy == this.loggedInUser.id
            ) {
                return true;
            }
            return false;
        },
        showOverriddeContractApproval() {
            const contractApprovalAssignedTo = this.contract.contractApprovalRequests.find(
                a => a.assignedToId === this.loggedInUser.id && a.status === "pending",
            );

            if (
                this.isCoorporateSourcingTeam &&
                this.contract.isContractOverrided &&
                this.contract.overrideStatus === "override" &&
                contractApprovalAssignedTo
            ) {
                return true;
            }
            return false;
        },
        contractSuperCategory() {
            if(this.contract.ContractCategories && this.contract.ContractCategories.length) {
                return this.contract.ContractCategories[0].MstCategory
            }
        }
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        view-contract-detail(
            :contract="contract",
            :contractItems="contract.ContractItems",
            :vendor="contract.Vendor",
            :supercategory="contractSuperCategory",
            :areas="contract.ContractAreas ? contract.ContractAreas.map(a => a.MstArea.name).join(',') : ''",
            :showLogo="false",
            :categoryAdvancePayment="categoryAdvancePayment",
            :categoryDeliveryTerm="categoryDeliveryTerm",
            :showUplodedFiles="true",
            :isModal="false",
            @changePrice="changePrice($event)",
        )
            button.btn.btn-success.bbq-green-button.mr-2(v-if="sentToCoSourcingToVendor", @click="confirmSubmit('sent_to_co_sourcing')") Accept 
            button.btn.btn-success.bbq-green-button.mr-2(v-if="sentToCoSourcingToSourcing", @click="confirmSubmit('sent_to_co_sourcing')") Approve
            button.btn.btn-primary.bbq-green-button.mr-2(v-if="showRejectButtonToCS && !showOverriddeContractApproval", @click="confirmSubmit('approved')") Approve 
            button.btn.btn-success.bbq-green-button.mr-2(v-if="showApproveButton && showSentToCoSourcing", @click="confirmSubmit('approved')") {{ isVendor ? 'Accept ' : 'Approve '}}
            button.btn.btn-success.bbq-green-button.mr-2(v-if="showCancelContractRequestButton", @click="confirmSubmit('sent_contract_cancel_request')") Send Cancel Contract Request
            button.btn.btn-success.bbq-green-button.mr-2(v-if="showCancelContractButton", @click="confirmSubmit('contract_cancelled')") Cancel Contract
            button.btn.btn-primary.bbq-green-button.mr-2(v-if="showAcceptChangeButton && showSentToCoSourcing && !isCoorporateSourcingTeam", @click="changeRequest('approved')") Approve
            
            button.btn.btn-primary.mr-2(v-if="showRequestChangeButton", @click="confirmSubmit('change_request')") Request Change
            
            button.btn.btn-danger.mr-2(v-if="showRejectButtonToCS && !showOverriddeContractApproval", @click="confirmSubmit('rejected_by_co_sourcing')") Reject 
            button.btn.btn-danger.mr-2(v-if="showRejectButton", @click="confirmSubmit('rejected_by_vendor')",) Reject 
            button.btn.btn-danger.mr-2(v-if="showAcceptChangeButton", @click="changeRequest('rejected_by_sourcing')") Reject
            
            button.btn.btn-info.mr-2(v-if="showSendToVendorButton", @click="sendToVendor()") Send To Vendor
            button.btn.btn-secondary.mr-2(v-if="showEditButton", @click="$utility.goToPage('contract.edit', { id :  contract.id } )") Edit
            button.btn.btn-primary.mr-2.pdf-button(@click="downloadAsPDF") Download as PDF
            button.btn.btn-secondary.mr-2(@click="changeRoute()") Back

            button.btn.btn-primary.mr-2(v-if="showOverrideContract", @click="overrideContract()") Override Contract

            button.btn.btn-success.bbq-green-button.mr-2(v-if="showOverriddeContractApproval", @click="confirmOverrideSubmit('override_approved_by_co_sourcing')") Approve 
            button.btn.btn-danger.mr-2(v-if="showOverriddeContractApproval", @click="confirmOverrideSubmit('override_rejected_by_co_sourcing')") Reject

</template>

<style lang="scss"></style>
