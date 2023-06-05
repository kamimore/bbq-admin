<script>
export default {
    name: "ViewSurveyNotes",
    props: {
        surveyNotes: {
            type: Array,
            required: true,
        },
    },
};
</script>

<template lang="pug">
div
    .row
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-SN Project Notes
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12(v-if="surveyNotes && surveyNotes.length")
                        .view-survey-notes
                            div(v-for="item in surveyNotes")
                                b-card.mb-2(:key="item.id")
                                    b-card-text.notes-heading {{item.SurveyNoteCreatedBy.fullName}}
                                        .survey-date.pull-right.draft-text {{item.created_at | date-format}}
                                    b-card-text.notes-text.bbq-font-sm.text-justify {{item.text}}
                    .col-sm-12(v-else)
                        span No note added yet.
</template>

<style lang="scss">
.date {
    float: right;
    font-weight: 400;
    color: orangered;
}
.scroll {
    height: 320px;
    overflow-y: scroll;
}
.view-survey-notes .card-body {
    padding: 0 !important;
    margin: 0;
}
.view-survey-notes .card-body p.card-text.notes-heading {
    padding: 3px 10px;
    margin: 0;
    background: #fbfbfb;
}
.view-survey-notes .card-body .notes-text {
    padding: 3px 10px;
    margin: 0;
}
</style>
