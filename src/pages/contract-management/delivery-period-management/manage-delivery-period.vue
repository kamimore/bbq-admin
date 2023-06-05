<script>
export default {
    name: "ManageDelieryPeriod",
    props: {
        mode: {
            type: String,
            default: "add",
        },
        currentPeriod: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            deliveryPeriod: {},
            options: [
                { name: "Days", value: "Days" },
                { name: "Week", value: "Week" },
                { name: "Month", value: "Month" },
                { name: "Year", value: "Year" },
                { name: "---- ", value: "NA" },
            ],
            items: {},
        };
    },
    methods: {
        save() {
            this.$emit("action", this.deliveryPeriod);
        },
    },
    watch: {
        // mode(val) {
        //     if (val === "add") {
        //         this.deliveryPeriod.value = null;
        //         this.deliveryPeriod.period = null;
        //     }
        // },
        currentPeriod(val) {
            if (!val) return;
            if (this.mode === "add") {
                this.deliveryPeriod.value = null;
                this.deliveryPeriod.period = null;
            } else {
                this.deliveryPeriod = this.currentPeriod;
            }
        },
    },
};
</script>
<template lang="pug">
    form.add-delivery-period.row(@submit.prevent="save()")
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-AV {{mode | humanize }} Delivery Period
            //- hr
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            attribute="Delivery Term",  
                            v-model="deliveryPeriod.value"
                            input-type="number",
                            placeholder="Delivery Interval"
                            :required="true",
                        )
                    .col-sm-12
                        form-field(
                            attribute="Delivery Period",
                            v-model="deliveryPeriod.period"
                            input-type="select-option",
                            :items="options"
                            track-by="value",
                            label="name"
                            placeholder="Delivery Period"
                            :required="true",
                        )
        .col-sm-12.mt-3
            .text-right
                button.btn.btn-primary.popup-button.bbq-btn-primary {{ mode === 'add' ? 'Save' : 'Update' }} 
</template>