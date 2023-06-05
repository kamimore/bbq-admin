<script>
export default {
    name: "SubmitDetails",
    props: {},
};
</script>

<template lang="pug">
.col-md-12.text-right.pt-4
    button.btn.btn-success.mr-2(@click="$emit('submit', 'submit')") Submit
    button.btn.btn-danger.mr-2(@click="$utility.goToPage('contract.history')") Back
    button.btn.btn-secondary.mr-2(@click="$emit('submit', 'save')") Save and exit
</template>
