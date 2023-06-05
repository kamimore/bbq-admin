<script>
export default {
    name: "ManageTemplateCategory",
    props: {
        mode: {
            type: String,
            default: "add", // add , edit
        },
        template: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            items: [],
        };
    },
    methods: {
        save() {
            this.$emit("action");
        },
    },
};
</script>

<template lang="pug">
    form.templete-category.row(@submit.prevent="save()")
        .col-sm-12
            .title-style-1.text-barbique.font-weight-400.custom-arrow-add-AV {{mode | humanize }} Template Category
            //- hr
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            attribute="Template Category",
                            v-model="template.content"
                            input-type="text",
                            placeholder="Template Category"
                            :required="true",
                        )
        .col-sm-12.mt-3
            .text-right
                button.btn.btn-primary.popup-button.bbq-btn-primary(:disabled="!template.content") {{ mode === 'add' ? 'Save' : 'Update' }} 
</template>
<style lang="scss">
.templete-font label {
    font-weight: 500 !important;
}
</style>

