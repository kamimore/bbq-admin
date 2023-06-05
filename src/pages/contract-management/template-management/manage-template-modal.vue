<script>
import { VueEditor } from "vue2-editor";
export default {
    name: "ManageTemplateModal",
    components: {
        VueEditor,
    },
    props: {
        mode: {
            type: String,
            default: "add", // add , edit, view
        },
        template: {
            type: Object,
            default: () => {},
        },
        templateHeading: {
            type: Array,
            default: () => [],
        },
        mstSuperCategories: {
            type: Array,
            default: () => [],
        },
        mstCategories: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            items: [],
            selectedSuperCategories: [],
            selectedCategories: [],
            customToolbar: [
                ["bold", "italic", "underline", "strike"],
                // [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
                [{ script: "sub" }, { script: "super" }],
                [{ color: [] }, { background: [] }],
            ],
        };
    },
    created() {
        this.items = this.template.MstSubTermConditions.filter(t => !t.isDeleted);
    },
    methods: {
        save() {
            this.$emit("action", this.items, this.selectedCategories);
        },
        deleteItem(index) {
            this.notDeletedItems[index].isDeleted = true;
        },
        addItem() {
            const emptyDes = this.notDeletedItems.filter(i => !i.content).length;

            if (emptyDes) return this.$utility.showErrorMessage("Description can not be empty");

            this.items.push({ content: "", isDeleted: false });
        },
    },
    computed: {
        notDeletedItems() {
            if (!this.items) return [];
            return this.items.filter(t => !t.isDeleted);
        },
        templateHeadingOption() {
            return this.templateHeading.map(c => ({ name: c.content, value: c.id }));
        },
        filteredCategories() {
            if (!this.mstCategories || !this.mstCategories.length) return [];
            const ids = this.selectedSuperCategories.map(s => s.id);

            return this.mstCategories.filter(s => ids.includes(s.superCategoryId));
        },
        toDisable() {
            return this.mode === "view";
        },
        isValidate(){
            if(this.selectedCategories && !this.selectedCategories.length) return false;
            if(!this.template.content || !this.template.parentId) return false;

            const emptyContent = this.notDeletedItems.find(i => !i.content);
            if(emptyContent) return false;
            return true;
        },
    },
    watch: {
        template(val) {
            if (!val) return null;

            if (this.mode === "add") {
                this.template.title = null;
                this.items = [{ content: "", isDeleted: false }];
                this.selectedSuperCategories = [];
                this.selectedCategories = [];
            } else {
                this.template.title = val.title;
                const items = val.TermConditions.filter(t => !t.isDeleted);
                this.items = this.$lodash.sortBy(items, ['id'])
                this.selectedCategories = val.CategoryTermConditions.map(v => v.MstCategory);

                const superCatIds = this.selectedCategories.map(s => s.superCategoryId);
                this.selectedSuperCategories = this.mstSuperCategories.filter(s => superCatIds.includes(s.id));
            }
        },
    },
};
</script>

<template lang="pug">
    .manage-templete-modal
        form.manage-templete.row(@submit.prevent="save()")
            div
                .col-sm-12
                    .title-style-1.text-barbique.font-weight-400.custom-arrow-add-AV {{mode | humanize }} Term & Condition Template
                .manage-temp.sweet-modal-max-height
                    .row
                        .col-sm-12
                            form-field-input.pull-left(
                                v-model="template.isSpecial",
                                attribute="Special Term",
                                input-type="checkbox-border",
                                label="Special Term",
                                :disabled="toDisable",
                            )
                        .col-sm-6
                            form-field(
                                v-model="template.parentId",
                                attribute="Template Category",
                                input-type="select-option",
                                :items="templateHeadingOption",
                                :required="true",
                                :disabled="toDisable"
                            )
                        .col-sm-6
                            form-field(
                                v-model="template.content",
                                input-type="text",
                                attribute="Template Heading"
                                label='Template Heading',
                                placeholder="Template heading..",
                                :disabled="toDisable"
                            )
                        .col-sm-6
                            form-field(
                                v-model="selectedSuperCategories",
                                inputType="search-multiple-select",
                                label="name",
                                attribute="Super Category",
                                trackBy="id",
                                :items="mstSuperCategories",
                                placeholder="Select Super Category",
                                :disabled="toDisable",
                                @clearAll="selectedSuperCategories = []"
                                :showClearAll="true"
                            )
                        .col-sm-6
                            form-field(
                                v-model="selectedCategories",
                                inputType="search-multiple-select",
                                label="name",
                                attribute="Category",
                                trackBy="id",
                                :items="filteredCategories",
                                placeholder="Select Category",
                                :disabled="toDisable",
                                @clearAll="selectedCategories = []",
                                :showClearAll="true"
                            )
                        .col-sm-12
                            label Sub Template Content
                        .templete-content
                            .div(v-for="(sub,index) of notDeletedItems")
                                .col-sm-cu-12
                                    p(v-if="mode === 'view'", v-html="sub.content", disabled)
                                    vue-editor.html-editor(v-else, v-model="sub.content", :editorToolbar="customToolbar", :disabled="toDisable")
                                    //- form-field-input(
                                    //-     v-model="sub.content",
                                    //-     input-type="textarea",
                                    //-     attribute="Sub Template Content"
                                    //-     label='Template Content',
                                    //-     placeholder="Sub Template Content",
                                    //-     :disabled="mode === 'view'"
                                    //- )
                                    .col-sm-cu-1.mt-4
                                        v-icon.far.fa-trash-alt(v-if="notDeletedItems.length > 1 && mode !=='view' " , small, @click='deleteItem(index)')
                                        v-icon.far.fa.fa-plus.ml-2(v-if="index === notDeletedItems.length - 1 && mode !=='view' ", small, @click='addItem()')
                .clearfix
                .col-sm-12.mt-3
                    .text-right
                        button.btn.btn-primary.popup-button.bbq-btn-primary(
                            v-if="mode !=='view'",
                            :disabled="!isValidate", 
                        ) {{ mode === 'add' ? 'Save' : 'Update' }} 
</template>
<style lang="scss">
.templete-font label {
    font-weight: 500 !important;
}
.col-sm-cu-1 {
    position: absolute;
    right: -20px;
    top: 12px;
}
.col-sm-cu-1 i.v-icon.far.fa-trash-alt {
    display: block;
    margin-left: 7px;
}
.col-sm-cu-1 i.v-icon.far.fa.fa-plus {
    margin-top: 12px;
}
.col-sm-cu-12 {
    width: 95%;
    margin: 10px 10px 10px 10px;
    position: relative;
}
.templete-content {
    max-height: 220px;
    width: 100%;
    overflow-y: auto;
    position: relative;
    margin-left: 15px;
    margin-right: 15px;
    -webkit-box-shadow: inset 0 1px 2.94px 0.06px rgba(4, 26, 55, 0.16);
    box-shadow: inset 0 1px 2.94px 0.06px rgba(4, 26, 55, 0.16);
}
.templete-content .ql-editor {
    min-height: 145px;
    font-size: 16px;
}
</style>

