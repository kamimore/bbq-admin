<script>
import DLayout from "@layouts/default-layout";
import ManageAdvancePayment from "./manage-advance-payment";
import ManageCategory from "./manage-category";
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name: "AdvancePaymentManagement",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
        ManageAdvancePayment,
        ManageCategory,
    },
    data() {
        return {
            headers: [
                { text: "S No.", value: "index", sortable: false },
                { text: "Advance Payment (%)", value: "value" },
                { text: "Actions", value: "actions", sortable: false, align: "right", width:"10%" },
            ],
            items: [],
            search: null,
            mode: "add",
            selectedPayment: {},
            mstSuperCategories: [],
            mstCategories: [],
            selectedSuperCategories: [],
            selectedCategories: [],
            selectedDeliveryItems: [],
        };
    },
    async created() {
        this.$Progress.start();
        this.isLoading = true;
        [
            this.mstSuperCategories, 
            this.mstCategories
        ] = await Promise.all([
            this.$http.get("mst-super-category", {
                attributes: {
                    exclude: ["created_at", "updated_at"],
                },
            }),
            this.$http.get("mst-category", {
                attributes: {
                    exclude: ["created_at", "updated_at"],
                },
            }),
        ]);
        this.getData(),
        this.getSelectedCategory();
        this.$Progress.finish();
    },
    methods: {
        async getData() {
            this.isLoading = true;
            const query = {
                where: {
                    isDeleted: false,
                },
            };
            this.items = await this.$http.get("mst-advance-payment", query);
            this.isLoading = false;
        },
        manageAdvancePayment(type, currentPAyment = {}) {
            this.mode = type;

            if (type === "edit") {
                this.selectedPayment = currentPAyment;
            }
            this.$refs.manage_advance_payment.open();
        },
        manageCategories() {
            this.$refs.manage_categories.open();
        },
        async getSelectedCategory() {
            this.selectedDeliveryItems = await this.$http.get("category-advance-payment");
            const createdDeliveryItemsList = this.selectedDeliveryItems.map(a => a.subCategoryId);

            this.selectedCategories = this.mstCategories.filter(a => createdDeliveryItemsList.includes(a.id));
            const superCategories = this.selectedCategories.map(a => a.superCategoryId);

            this.selectedSuperCategories = this.mstSuperCategories.filter(a => superCategories.includes(a.id));
        },
        async saveCategories(data) {
            const subCategoryId = data.map(a => ({ subCategoryId: a.id }));

            await this.$http.bulkDelete("category-advance-payment", this.selectedDeliveryItems);
            await this.$http.bulkCreate("category-advance-payment", subCategoryId);
            this.$refs.manage_categories.close();
            this.getSelectedCategory();
            this.$utility.showSucessMessage("Categories successfully updated");
        },
        emitRoot() {
            this.$root.$emit("clearCategories");
        },
        async createOrUpdate(data) {
            try {
                await this.$http.updateOrCreate("mst-advance-payment", data);
                this.$utility.showSucessMessage("Advance Payment successfully created.");
                this.$refs.manage_advance_payment.close();
                this.getData();
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
        async deleteItem(id) {
            const message = `Are you sure you want to delete?`;
            this.$confirm(message, "Delete Advance Payment", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                // await this.$http.updateById("mst-advance-payment", id, {
                //     isDeleted: true,
                // });
                await this.$http.delete("mst-advance-payment", id);
                this.$utility.showSucessMessage("Advance Payment deleted");
                this.getData();
            });
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        .mb-3.bg-white.payment-delivery-management 
            .card
                .card-header.edit-categories.pt-3
                    .pull-right
                        button.btn.btn-primary.bbq-btn-primary(type='button', @click="manageCategories()") Edit Categories
                    h4 Selected Categories 
                .card-body
                    .row
                        .col-sm-12.pb-2
                            .row
                                .col-sm-2.custom-col-2
                                    h5 Super Category
                                .col-sm-10(v-if="selectedSuperCategories && selectedSuperCategories.length")
                                    span.mr-2.mb-1.bbq-tag(v-for="item in selectedSuperCategories" :key="item.id")
                                        span {{item.name | humanize}}
                                .col-sm-10(v-else)
                                    span.mr-2.mb-1.text-muted No Supercategory selected
                        .col-sm-12
                            .row
                                .col-sm-2.custom-col-2
                                    h5 Category
                                .col-sm-10(v-if="selectedCategories && selectedCategories.length")
                                    span.mr-2.mb-1.bbq-tag(v-for="item in selectedCategories" :key="item.id")
                                        span {{item.name | humanize }}
                                .col-sm-10(v-else)
                                    span.mr-2.mb-1.text-muted No Category selected
        v-toolbar.pb-2.pt-2(flat, color='white')
            v-spacer
            .pull-right
                button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="manageAdvancePayment('add')") Add Advance Payment
        v-data-table.user-li-table.fixed-hight-table(
            :headers='headers', 
            :search="search", 
            :items='items', 
            :rows-per-page-items="[10]",
            :loading="isLoading", 
            :no-data-text="loaderText"
        )
            template(v-slot:items='props')
                td.text-left {{ props.index + 1 || '-'}}
                td.text-left(v-if="props.item.value == 0") NA
                td.text-left(v-else) {{ props.item.value | humanize}}
                td.text-right
                    v-icon.mr-3.far.fa-edit(small, @click="manageAdvancePayment('edit', props.item)")
                    v-icon.far.fa-trash-alt(small, @click="deleteItem(props.item.id)")
        sweet-modal(
            ref="manage_advance_payment",
            width="35%",
            overlay-theme="dark",
        )
            manage-advance-payment(
                :currentPayment="selectedPayment",
                :mode="mode",
                @action="createOrUpdate"
            )
        sweet-modal(
            ref="manage_categories",
            width="45%",
            overlay-theme="dark",
            @close="emitRoot"
        )
            manage-category(
                :selectedSuperCategories="selectedSuperCategories",
                :selectedCategories="selectedCategories",
                :mstSuperCategories="mstSuperCategories",
                :mstCategories="mstCategories",
                @saveCategories="saveCategories"
            )

</template>