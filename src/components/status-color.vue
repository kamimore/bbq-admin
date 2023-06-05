<script>
export default {
    name: 'StatusColor',
    props: {
        type: {
            type: String,
            default: '',
        },
        text: {
            type: String,
            default: '',
        },
    },
    computed:{
        textClass(){
            if(this.type.includes("draft")) return 'draft-text';
            if(this.type.includes("pending")) return 'pending-text';
            if(this.type.includes("reject")) return 'reject-text';
            if(this.type.includes("approve")) return 'approved-text';
            if(this.type.includes("send_to_vendor")) return 'approved-text';
            if(this.type.includes("change")) return 'draft-text';
            if(this.type.includes("complete")) return 'approved-text';

            return "draft-text";
        },
    }
}
</script>

<template lang="pug">
span.bbq-status-tag(:class="textClass") {{text | humanize}}
</template>

<style lang="scss">
</style>
