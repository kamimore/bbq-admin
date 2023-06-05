<script>
import DLayout from "@layouts/default-layout";
import ManageVendorType from "./manage-vendor-type";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "VendorType",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
        ManageVendorType,
    },
    data() {
        return {
            headers: [
                { text: "S No.", name: "index", sortable: false },
                { text: "Vendor Type", name: "name", sortable: true },
                { text: "Actions", name: "actions", sortable: false, align: "right", width: "10%" },
            ],
            items: [],
            mode: "add",
            selectedItem: {},
        };
    },
    async created() {
        this.$Progress.start();
        this.isLoading = true;

        this.getData();

        this.$Progress.finish();
    },
    methods: {
        async getData() {
            this.isLoading = true;

            const query = {
                where: {
                    isDeleted: false,
                },
                order: [["id", "ASC"]],
            };
            this.items = await this.$http.get("mst-vendor-type", query);

            this.isLoading = false;
        },
        async createOrUpdate(data) {
            try {
                await this.$http.updateOrCreate("mst-vendor-type", data);
                this.$utility.showSucessMessage(`Vendor type successfully ${data && data.id ? "updated" : "created"}`);
                this.$refs.manage_vendor_type.close();
                this.getData();
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
        async deleteItem(id) {
            const message = `Are you sure you want to delete?`;
            this.$confirm(message, "Delete Vendor type", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                await this.$http.updateById("mst-vendor-type", id, {
                    isDeleted: true,
                });
                this.$utility.showSucessMessage("Vendor type deleted successfully");
                this.getData();
            });
        },
        manageVendorType(type, item = {}) {
            this.mode = type;
            this.selectedItem = item;
            this.$refs.manage_vendor_type.open();
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        v-toolbar.pb-2.pt-2(flat, color='white')
            v-spacer
            .pull-right
                button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="manageVendorType('add')") Add Vendor Type
        v-data-table.user-li-table.fixed-hight-table(
            :headers='headers', 
            :items='items', 
            :rows-per-page-items="[10]",
            :loading="isLoading", 
            :no-data-text="loaderText"
        )
            template(v-slot:items='{ index, item }')
                td.text-left {{ index + 1 || '-'}}
                td.text-left {{item.name || '-'}}
                td.text-right
                    v-icon.mr-3.far.fa-edit(small, @click="manageVendorType('edit', item)")
                    v-icon.far.fa-trash-alt(small, @click="deleteItem(item.id)")
        sweet-modal(
            ref="manage_vendor_type",
            width="30%",
            overlay-theme="dark",
        )
            manage-vendor-type(
                :selectedItem="selectedItem",
                :mode="mode",
                @action="createOrUpdate"
            )
</template>