<script>
import DLayout from "@layouts/default-layout";
import ManageTemplateModal from "./manage-template-modal";
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name: "ManageTemplate",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
        ManageTemplateModal,
    },
    data() {
        return {
            search: null,
            items: [],
            templateHeading: [],
            mstSuperCategories: [],
            mstCategories: [],
            selectedCategories: [],
            mode: "add",
            selectedTemplate: {
                parentId: "",
                content: "",
                MstSubTermConditions: [],
            },
            headers: [
                { 
                    text: "Template Heading", 
                    value: "content", 
                    // width: "25%" 
                },
                { 
                    text: "Template Category", 
                    value: "content",
                    // width: "25%" 
                },
                { 
                    text: "Sub Category",
                    value: "" ,
                    // width: "35%"
                },
                { 
                    text: "Actions",
                    value: "actions",
                    sortable: false, 
                    align: "right", 
                    width: "15%" 
                },
            ],
        };
    },
    async created() {
        [
            this.mstSuperCategories,
            this.mstCategories,
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
            this.getItem(),
        ]);
    },
    methods: {
        async getItem() {
            this.isLoading = true;
            this.templateHeading = await this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: 0,
                },
                order: [
                    ['id', 'ASC'],
                ],
            });

            const result = await this.$http.get("term-condition", {
                where: {
                    isDeleted: false,
                    parentId: {
                        $ne: 0,
                    },
                },
                include: [{
                    model: "TermCondition",
                    where: {
                        isDeleted: false,
                    },
                    // order: [
                    //     ['id', 'ASC'],
                    // ],
                },{
                    model: "CategoryTermCondition",
                    include: [{
                        model: 'MstCategory'
                    }],
                }],
            });

            this.items = result.map(r => {
                const templateCategory = this.templateHeading.find(t => t.id === r.parentId);
                if (templateCategory) r.templateCategory = templateCategory.content;
                if(r.CategoryTermConditions && r.CategoryTermConditions.length){
                    const categories = r.CategoryTermConditions
                    .filter(c => c.MstCategory && c.MstCategory.name)
                    .map(c => c.MstCategory.name);
                    r.subCategories = categories.join(' ,');
                }
                return r;
            });
            this.isLoading = false;
        },
        subCategories(item) {
            if(!item) return '-'
            return item.split(',');
        },
        async deleteItem(id) {
            const message = `Are you sure you want to delete?`;

            this.$confirm(message, "Delete Template", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                await this.$http.updateById("term-condition", id, {
                    isDeleted: true,
                });
                this.$message.warning("Template successfully deleted");
                this.getItem();
            });
        },
        async creatOrUpdate(items, selectedCategory) {
            try {
                console.log('selectedCategory', selectedCategory);
                console.log('selectedTemplate', this.selectedTemplate);
                console.log('items', items);

                if (this.selectedTemplate 
                    && this.selectedTemplate.CategoryTermConditions 
                    && this.selectedTemplate.CategoryTermConditions.length
                ) {
                    await this.$http.bulkDelete("category-term-condition", this.selectedTemplate.CategoryTermConditions);
                }

                const result = await this.$http.updateOrCreate("term-condition", this.selectedTemplate);

                 if (selectedCategory && selectedCategory.length) {
                    const categories = selectedCategory.map(c => ({ termConditionId: result.id, subCategoryId: c.id }));
                    await this.$http.bulkCreate("category-term-condition", categories);
                }

                await this.$http.bulkUpdateOrCreate(
                    "term-condition",
                    items.map(d => ({
                        ...d,
                        ...{ parentId: result.id },
                    })),
                );

                this.successMessage = `Template successfully ${this.mode === "edit" ? "updated" : "created"}`;

                this.$utility.showSucessMessage(this.successMessage);

                this.$refs.manage_template_modal.close();

                this.getItem();
            } catch (err) {
                console.log('error', err);
                this.$utility.showErrorMessage("Unable to add the template");
            }
        },
        manageTemplate(type, template = {}) {
            this.mode = type;
            if (type === "add") {
                this.selectedTemplate = {
                    content: "",
                    MstSubTermConditions: [{ content: "", isDeleted: false }],
                };
            } else {
                this.selectedTemplate = template;
            }
            this.$refs.manage_template_modal.open();
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        v-app.custom-shadow
            v-toolbar.mb-2.mt-2(flat, color='white')
                v-text-field(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                v-spacer
                .pull-right.pt-1
                    button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="manageTemplate('add')") Add Template
            v-data-table.user-li-table(
                :headers='headers', 
                :search="search", 
                :items='items', 
                :rows-per-page-items="[10]",
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='props')
                    td {{ props.item.content || '-'}}
                    td {{ props.item.templateCategory || '-'}}
                    td {{ props.item.subCategories | capitalize}}
                    td.text-right
                        v-icon.mr-3.far.fa-eye(small, @click="manageTemplate('view', props.item)")
                        v-icon.mr-3.far.fa-edit(small, @click="manageTemplate('edit', props.item)")
                        v-icon.far.fa-trash-alt(small, @click="deleteItem(props.item.id)")
        sweet-modal.manage-templete(
            ref="manage_template_modal",
            width="60%",
            overlay-theme="dark",
        )   
            manage-template-modal(
                :mode="mode",
                :template="selectedTemplate",
                :templateHeading="templateHeading",
                :mstSuperCategories="mstSuperCategories",
                :mstCategories="mstCategories",
                @action="creatOrUpdate",
            )
</template>

<style lang="scss">
</style>
