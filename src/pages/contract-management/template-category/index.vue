<script>
import DLayout from "@layouts/default-layout";
import ManageTemplateCategory from "./manage-template-category.vue";
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name:'TemplateCategory',
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
        ManageTemplateCategory,
    },
    data() {
        return {
            search: null,
            items: [],
            templateCategory: [],
            mode: "add",
            templateHeading: [],
            template: {
                parentId: "",
                content: "",
            },
            headers: [
                { text: "S No.", value: "index", sortable: false },
                { text: "Template Category", value: "content" },
                { text: "Actions", value: "actions", sortable: false, align: "right", width:"10%" },
            ],
        };
    },
    created() {
        this.getTemplateCategory();
    },
    methods: {
        async getTemplateCategory() {
            this.isLoading = true;
            this.templateHeading = await this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: 0,
                },
            });
            this.isLoading = false;
        },
        async deleteItem(id) {
            const message = `Are you sure you want to delete?`;
            this.$confirm(message, "Delete Template Category", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                await this.$http.updateById("term-condition", id, {
                    isDeleted: true,
                });
                this.$message.warning("Template Category successfully deleted");
                this.getTemplateCategory();
            });
        },
        async creatOrUpdate() {
            try {
                await this.$http.updateOrCreate("term-condition", this.template);

                this.successMessage = `Template successfully ${this.mode === "edit" ? "updated" : "created"}`;

                this.$utility.showSucessMessage(this.successMessage);

                this.$refs.manage_template_modal.close();

                this.getTemplateCategory();
            } catch (err) {
                this.$utility.showErrorMessage("Some error occurred");
            }
        },
        manageTemplate(type, template = {}) {
            this.mode = type;
            if (type === "add") {
                this.template = {
                    content: "",
                };
            } else {
                this.template = template;
            }
            this.$refs.manage_template_modal.open();
        },
    },
};
</script>
<template lang="pug">
d-layout
    template(slot='body')
        .custom-shadow
            v-app.table-shadow
                v-toolbar.mb-2.mt-2(flat, color='white')
                    v-text-field(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                    v-spacer
                    .pull-right.pt-1
                        button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="manageTemplate('add')") Add Template Category
                v-data-table.user-li-table(
                    :headers='headers', 
                    :search="search", 
                    :items='templateHeading', 
                    :rows-per-page-items="[10]" 
                    :loading="isLoading", 
                    :no-data-text="loaderText"
                )
                    template(v-slot:items='props')
                        td.text-left {{ props.index + 1 || '-'}}
                        td.text-left {{ props.item.content || '-'}}
                        td.text-right
                            v-icon.mr-3.far.fa-edit(small, @click="manageTemplate('edit', props.item)")
                            v-icon.far.fa-trash-alt(small, @click="deleteItem(props.item.id)")
            sweet-modal(
                ref="manage_template_modal",
                width="35%",
                overlay-theme="dark",
            )   
                manage-template-category(
                    :mode="mode",
                    :template="template",
                    :templateCategory= "templateCategory",
                    @action="creatOrUpdate",
                )
</template>

<style lang="scss">
</style>
