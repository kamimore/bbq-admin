<script>
export default {
    name: "ManageVendorType",
    props: {
        mode: {
            type: String,
            default: "add",
        },
        selectedItem: {
            type: Object,
            default: () => {},
        },
    },
};
</script>

<template lang="pug">
    form.advance-payemnt-category.row(@submit.prevent="$emit('action', selectedItem)")
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-AV {{mode | humanize }} Vendor Type
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            attribute="Vendor Type",  
                            v-model="selectedItem.name"
                            input-type="text",
                            placeholder="Vendor Type"
                            :required="true",
                        )
        .col-sm-12.mt-3
            .text-right
                button.btn.btn-primary.popup-button.bbq-btn-primary {{ mode === 'add' ? 'Save' : 'Update' }} 
</template>