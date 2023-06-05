<script>
export default {
    name: "SpecialTermModal",
    props: {
        contract: {
            type: Object,
            default: () => {},
        },
        items: {
            type: Array,
            default: () => [],
        },
        selectedItems: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            selectedTemplate: [],
        };
    },
    created() {
        this.setselectedTemplate();
    },
    methods: {
        setselectedTemplate() {
            if (this.contract && this.contract.id) {
                const contractTermId = this.contract.ContractTemplates.map(a => a.templateId);
                this.selectedTemplate = [];

                this.items.forEach(a => {
                    a.TermConditions.forEach(contract => {
                        const items = contract.TermConditions.filter(b => contractTermId.includes(b.id));
                        if (items && items.length) {
                            items.forEach(i => this.selectedTemplate.push(i));
                        }
                    });
                });
            }
        },
        async save() {
            if (this.selectedTemplate && !this.selectedTemplate.length) return this.$emit("save", []);

            const termIds = this.selectedTemplate.map(i => i.id);

            let parseItems = await this.findTermParents(termIds);

            this.$emit("save", parseItems, termIds);
        },
        findTermParents(itemIds) {
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
                                    id: {
                                        $in: itemIds,
                                    },
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
    },
    watch: {
        selectedItems() {
            this.setselectedTemplate();
        },
    },
};
</script>
<template lang="pug">
div
    .title-style-1.text-barbique.custom-arrow-add-AV  Add Special Terms
    .container-fluid
        .row
            .col-md-12.grid-margin.stretch-card.no-mar-pad
                .category-p.cat-templete.sweet-modal-max-height
                    .row.mt-2(v-if="items && !items.length")
                        .col-sm-12
                            .form-group
                                span No term and condition found for selected category
                    .row.mt-2(v-else, v-for="item in items", :key="item.id")
                        .col-sm-12
                            .custom-control.custom-check.width-100
                                .card.bg-light
                                    .card-header {{item.content}}
                                    .card-body
                                        div(
                                            v-for="subItem in item.TermConditions", 
                                            :key="subItem.id"
                                        )
                                            p.font-weight-bold(v-if="item.TermConditions.length > 1") {{subItem.content}} :
                                            el-checkbox-group(
                                                v-model="selectedTemplate"
                                            )
                                                el-checkbox.temp-box(
                                                    v-for="subsubItem in subItem.TermConditions", 
                                                    :key="subsubItem.id", 
                                                    :label="subsubItem"
                                                ) 
                                                    span.cursor-pointer(v-html="subsubItem.content") 
    .text-right.mt-4
        button.btn.btn-primary.mr-1.bbq-btn-primary(
            type='button', 
            :disabled="false", 
            @click="save()"
        ) Save
</template>
