<script>
export default {
    name: "ManageAdvancePayment",
    props: {
        mode: {
            type: String,
            default: "add",
        },
        currentPayment: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            advancePayment: {},
        };
    },
    methods: {
        save() {
            this.$emit("action", this.advancePayment);
        },
    },
    watch: {
        // mode(val) {
        //     if (this.mode === "add") {
        //         this.deliveryPeriod.value = null;
        //         this.deliveryPeriod.period = null;
        //     }
        // },
        currentPayment(val) {
            if (!val) return;
            if (this.mode === "add") {
                this.advancePayment.value = null;
                this.advancePayment.period = null;
            } else {
                this.advancePayment = this.currentPayment;
            }
        },
    },
};
</script>
<template lang="pug">
    form.advance-payemnt-category.row(@submit.prevent="save()")
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-AV {{mode | humanize }} Advance Payment
            //- hr
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            attribute="Advance Payment (%)",  
                            v-model="advancePayment.value"
                            input-type="number",
                            placeholder="Advance Payment"
                            :required="true",
                        )
        .col-sm-12.mt-3
            .text-right
                button.btn.btn-primary.popup-button.bbq-btn-primary {{ mode === 'add' ? 'Save' : 'Update' }} 
</template>