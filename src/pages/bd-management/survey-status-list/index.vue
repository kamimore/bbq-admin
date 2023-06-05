<script>
import { humanize } from "underscore.string";
import { mapGetters } from "vuex";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "SurveyStatusList",
    mixins: [DatatableSettingMixin],
    data() {
        return {
            dialog: false,
            headers: [
                {
                    text: "Region",
                    value: "region",
                    //   width: "25%"
                },

                { text: "Project Title", value: "title" },

                {
                    text: "Location",
                    value: "location",
                    // width: "25%"
                },

                {
                    text: "BD",
                    value: "bd",
                    //  width: "20%"
                },

                {
                    text: "Legal",
                    value: "legal",
                    align: "center",
                    //   width: "10%"
                },

                {
                    text: "Operations",
                    value: "operations",
                    align: "center",
                    //  width: "10%"
                },

                {
                    text: "Project",
                    value: "project",
                    align: "center",
                    //  width: "10%"
                },
            ],
            items: [],
            search: null,
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
                attributes: ["id", "status", "created_at", "title"],
                order: [["created_at", "DESC"]],
                include: [
                    {
                        model: "User",
                        as: "CreatedBy",
                        attributes: ["id", "fullName"],
                        include: [
                            {
                                model: "UserRegion",
                                include: [
                                    {
                                        model: "MstRegion",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: "SiteSurveyApproval",
                        attributes: ["id", "status", "comment"],
                        include: [
                            {
                                model: "User",
                                as: "SurveyApprovalAssignedTo",
                                attributes: ["id", "fullName"],
                                include: [
                                    {
                                        model: "Role",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: "Response",
                        attributes: ["id", "response", "question"],
                        include: [
                            {
                                model: "QuestionCategory",
                                where: {
                                    name: "location",
                                },
                                attributes: ["name", "order"],
                            },
                        ],
                    },
                ],
            };
            if (this.isBD) Object.assign(query.where, { createdById: this.userId });

            const surveys = await this.$http.get("site-survey", query);
            const items = [];

            for (const survey of surveys) {
                const data = {
                    id: survey.id,
                    status: survey.status,
                    created_at: survey.created_at,
                    bd: survey.CreatedBy ? survey.CreatedBy.fullName : "NA",
                    project: "",
                    legal: "",
                    operations: "",
                    region: "",
                    location: "",
                    title: "",
                };

                // if (survey.CreatedBy && survey.CreatedBy.UserRegions && survey.CreatedBy.UserRegions.length) {
                //     data.region = survey.CreatedBy.UserRegions.map(o => o.MstRegion.name).join(",");
                // }

                data.location = this.$utility.parseSiteLocation(survey.responses);
                data.region = this.$utility.parseSiteRegion(survey.responses);
                data.title = survey.title ? survey.title.toUpperCase() : survey.title;

                if (survey.SiteSurveyApprovals && survey.SiteSurveyApprovals.length) {
                    for (const role of ["project", "legal", "operations"]) {
                        if (survey && survey.SiteSurveyApprovals && survey.SiteSurveyApprovals.length) {
                            const approval = survey.SiteSurveyApprovals.find(s => {
                                if (s.SurveyApprovalAssignedTo && s.SurveyApprovalAssignedTo.role)
                                    return s.SurveyApprovalAssignedTo.role.name === role;
                            });
                            if (approval) data[role] = humanize(approval.status);
                        }
                    }
                }
                items.push(data);
            }

            this.items = items;
            this.isLoading = false;
        },
        textClass(status) {
            if (status === "Pending") return "warning-text";
            if (status === "Accepted") return "success-text";
            if (status === "Rejected") return "danger-text";
        },
        // manageItem(id) {
        //     this.$utility.goToPage("bd.survey.view",{ siteSurveyId: id }, "query");
        // },
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
                    td {{ item.bd || '=' }}
                    td.status.text-center(v-if="item.legal",:class="textClass(item.legal)") 
                    td.status.text-center(v-else) -
                    td.status.text-center(v-if="item.operations",:class="textClass(item.operations)") 
                    td.status.text-center(v-else) -
                    td.status.text-center(v-if="item.project",:class="textClass(item.project)") 
                    td.status.text-center(v-else) - 
                    //td
                        v-icon.far.fa-eye(small, @click='manageItem(item.id)')
</template>

<style lang="scss">
.status.success-text {
    color: #28a645 !important;
    background-image: url("../../../assets/images/right-tick.png");
    background-size: 20px 20px;
    background-position: center center;
}

.status.danger-text {
    color: #dc3545 !important;
    background-image: url("../../../assets/images/wrong-close.png");
    background-size: 20px 20px;
    background-position: center center;
}

.status.warning-text {
    color: #e6b317 !important;
    background-image: url("../../../assets/images/process-pending.png");
    background-size: 20px 20px;
    background-position: center center;
}
</style>
