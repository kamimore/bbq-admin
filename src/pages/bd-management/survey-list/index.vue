<script>
    import {
        mapGetters
    } from "vuex";
    import ViewSurveyNotes from './components/view-survey-notes.vue';
    import DatatableSettingMixin from '@mixins/datatable-setting';
    
    export default {
        name: "SurveyList",
        mixins: [DatatableSettingMixin],
        components: {
            ViewSurveyNotes
        },
        data() {
            return {
                dialog: false,
                headers: [{
                        text: "Region",
                        value: "region",
                        // width: "15%",
                    },
                    {
                        text: "Project Title",
                        value: "title",
                        // width: "10%"
                    },
                    {
                        text: "Location",
                        value: "location",
                        // width: "25%"
                    },
                    {
                        text: "Created By",
                        value: "CreatedBy.fullName",
                        // width: "10%"
                    },
                    {
                        text: "Status",
                        value: "status",
                        // width: "10%"
                    },
                    {
                        text: "Created At",
                        value: "created_at",
                        // width: "10%"
                    },
                    {
                        text: "Actions",
                        value: "actions",
                        sortable: false,
                        align: 'center',
                        width: "15%"
                    },
                ],
                items: [],
                search: null,
                userId : null,
                selectedSurveyId: 0,
                surveyNotes: []
            };
        },
        async created() {
            this.userId = this.$store.getters["account/getUserId"];
            this.getData();
        },
        methods: {
            async getData() {
                this.isLoading = true;
                const query = {
                    where: {
                        isDeleted: false,
                    },
                    include: [{
                            model: "User",
                            as: "CreatedBy",
                            include: [{
                                model: "UserRegion",
                                include: [{
                                    model: "MstRegion",
                                }, ],
                            }, ],
                        },
                        {
                            model: "Response",
                            attributes: ["id", "response", "question"],
                            include: [{
                                model: "QuestionCategory",
                                where: {
                                    name: "location",
                                },
                                attributes: ["name", "order"],
                            }],
                        },
                    ],
                };

                if(this.isBD) Object.assign(query.where , { createdById: this.userId });
    
                const data = await this.$http.get("site-survey", query);
    
                this.items = data.map(survey => {
                    survey.location = this.$utility.parseSiteLocation(survey.responses);
                    survey.region = this.$utility.parseSiteRegion(survey.responses);
                    return survey;
                });
                this.isLoading = false;
            },
            manageItem(id) {
                this.$utility.goToPage(
                    "bd.survey.view", {
                        id,
                    },
                    "params",
                );
            },
            async deleteItem(id) {
                const message = `Are you sure you want to delete?`;
                this.$confirm(message, "Delete Project", {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    type: "error",
                    showCancelButton: true,
                    lockScroll: false
                }).then(async() => {
                    await this.$http.updateById("site-survey", id, {
                        isDeleted: true,
                    });
                    this.getData();
                });
            },
            async viewSurveyNotes(surveyId) {
                this.surveyNotes = await this.$http.get('site-survey-note', {
                    where: {
                        siteSurveyId: surveyId
                    },
                    include: [
                        {
                            model: 'User',
                            as: 'SurveyNoteCreatedBy'
                        }
                    ]
                });
                this.$refs.view_survey_notes.open();
                
            }
        },
        computed: {
            ...mapGetters("account", ["isBD", "isCO"]),
        },
    };
</script>

<template lang="pug">
div.custom-shadow
    v-app
        div.survey-ne
            v-toolbar.pb-3(flat, color='white')
                v-text-field(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                v-spacer
            v-data-table.table-shadow(
                :headers='headers', 
                :search="search", 
                :items='items', 
                :rows-per-page-items="[10]",
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='{ item }')
                    td {{ item.region || '-' }}
                    td {{ item.title | truncate(20)  }}
                    td {{ item.location || '-' }}
                    td {{ item.CreatedBy.fullName }}
                    td 
                        status-color(:type="item.status", :text="item.status")
                    td {{ item.created_at | dateFormat }}
                    td.text-center
                        .el-icon-chat-line-square.mr-2.cursor-pointer(@click='viewSurveyNotes(item.id)')
                        .far.fa-eye.mr-2.cursor-pointer(@click='manageItem(item.id)')
                        .far.fa-trash-alt.mr-2.cursor-pointer(@click='deleteItem(item.id)')

        sweet-modal.bbq-overflow-hidden(
            ref="view_survey_notes",
            width="45%",
            overlay-theme="dark",
        )
            view-survey-notes(
                :surveyNotes="surveyNotes"
            )
</template>

<style lang="scss">
</style>
