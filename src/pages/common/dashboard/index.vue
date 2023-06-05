<script>
import DLayout from "@layouts/default-layout";
import ContractGraphs from "./components/contract-graphs";
import VendorGraphs from "./components/vendor-graphs";
import moment from "moment";
import { groupBy } from "lodash";

export default {
    name: "Dashboard",
    components: {
        DLayout,
        ContractGraphs,
        VendorGraphs,
    },
    data() {
        const tabList = [
            { title: "Vendor", component: "vendor-graphs" },
            { title: "Contract", component: "contract-graphs" },
        ];
        return {
            tabList,
            currentView: tabList[0].component,
            dashboard: {},
            mstSuperCategory: [],
        };
    },
    created() {
        this.getData();
        this.getMstData();
    },
    methods: {
        async getMstData() {
            this.mstSuperCategory = await this.$http.get('mst-super-category')
        },
        async getData() {
            try {
                const result = await this.$http.get('dashboard');
                this.dashboard = result[0];
            } catch (err) {
                console.log(err)
                this.$utility.showErrorMessage(err)
            }
        },
        async getApprovedVendor(filter = 'week') {
            try {
                const query = {
                    where: {
                        status: 'approved_by_mdm',
                        created_at: {
                            $lt: moment(Date.now()).format('YYYY-MM-DD'),
                            $gt: moment(Date.now()).subtract(1, filter),
                        }
                    },
                    attribute: ['id'],
                    orderBy: ['created_by']
                };
                const result = await this.$http.get('vendor/find-and-count', query)
            } catch (err) {
                console.log(err)
                this.$utility.showErrorMessage(err.message)
            }
        }
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        .que-category-border-w-pad.bbq-no-border.custom-shadow 
            el-tabs(v-model='currentView',  stretch)
                el-tab-pane(
                    v-for="tab in tabList"
                    :label="tab.title",
                    :key="tab.component",
                    :name="tab.component"
                ) 
                    component(
                        :is="tab.component",
                        :item="dashboard"
                        :mstSuperCategory="mstSuperCategory",
                        :lazy="true"
                    )
</template>