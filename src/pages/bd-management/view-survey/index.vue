
<script>
// import { isEmpty } from "lodash";
import "video.js/dist/video-js.css";
import { videoPlayer } from "vue-video-player";

export default {
    name: "ViewSurvey",
    components: {
        videoPlayer,
    },
    data() {
        return {
            data: {},
        };
    },
    async created() {
        if (!this.$lodash.isEmpty(this.$router.currentRoute.params)) {
            const { id } = this.$router.currentRoute.params;
            if (id) {
                const result = await this.$http.get("question-category", {
                    where: {
                        isDeleted: false,
                    },
                    include: [
                        {
                            model: "Response",
                            where: {
                                siteSurveyId: id,
                            },
                            // required:false,
                        },
                    ],
                    order: [["order", "ASC"]],
                });
                this.data = result;
            }
        }
    },
    methods: {
        videoSrc(src) {
            return {
                muted: true,
                language: "en",
                playbackRates: [0.7, 1.0, 1.5, 2.0],
                sources: [
                    {
                        type: "video/mp4",
                        src,
                    },
                ],
            };
        },
        orderBy(items) {
            return this.$lodash.orderBy(items, ["question.order"], ["asc"]);
        },
    },
    computed: {
        player() {
            return this.$refs.videoPlayer.player;
        },
    },
};
</script>

<template lang="pug">
div
    .col-sm-12.no-padding
        div.view-servey(v-if="data && data.length > 0")
            div.card.que-category-border-w-pad-1.video-images.custom-shadow.mb-2(v-for='item in data', :key='item.id')
                div.card-header.cu-c-h.custom-arrow-survey {{item.name}}
                .card-data
                    .row.m-p-0
                        div.card-body.set-w(v-if="item.responses", v-for="response in orderBy(item.responses, 'question.order')")
                            .col-sm-12
                                .row
                                    .col-sm-5
                                        h5.card-title  {{response.question.label || '-'}} :
                                    .col-sm-7
                                        p.card-text(v-if="!['image','video'].includes(response.question.answerType)") {{  response.response.length ? response.response.join(',') : '-'}}
                                        span(v-else-if="response.response && !response.response.length") -
                                        span(v-else, v-for="answer in response.response")
                                            div.img-vid(v-if="response.question.answerType === 'video'")
                                                span(v-if="answer")
                                                    video-player(
                                                        class="video-player-box"
                                                        ref="videoPlayer"
                                                        :options="videoSrc(answer)"
                                                        :playsinline="true"
                                                    )
                                                span(v-else) NA
                                            div.img-cus(v-else-if="response.question.answerType === 'image'")
                                                a(:href="answer" target="_blank") 
                                                    img(:src="answer" alt="Image Title")
                                            div(v-else) NA
        div.view-servey.text-center(v-else) No item to show

</template>

<style lang="scss">
.card.mb-2 {
    position: relative;
    float: left;
    width: 100%;
}
.card-data {
    position: relative;
    float: left;
    width: 100%;
}
.set-w {
    width: 100%;
    max-width: 50%;
    float: left;
    position: relative;
    padding: 5px 0px 0px 0px !important;
}
.view-servey h5.card-title {
    font-size: 14px;
    color: #383e40;
    margin-bottom: 0;
    border-bottom: 0;
    padding-bottom: 5px;
}
.img-cus {
    display: inline-block;
    cursor: pointer;
    padding: 5px;
}
.img-vid {
    display: inline-block;
    cursor: pointer;
    padding: 5px;
}
.img-vid .video-player.video-player-box .video-js {
    width: 200px !important;
    height: 113px !important;
}
.view-servey .card-header.cu-c-h {
    background-color: #fff;
    text-transform: capitalize;
    font-size: 18px;
    font-weight: 400;
    padding: 2px 0;
    border-bottom: 0px dotted #ccc;
    color: #000000;
    padding-left: 16px;
}
.view-servey .video-images .img-cus a img {
    width: 100px !important;
    height: 50px !important;
}
.card.mb-3.que-category-border-w-pad h5.card-title {
    font-weight: 500;
}
.view-servey button.vjs-big-play-button {
    top: 33px;
    left: 53px;
}
.view-servey .que-category-border-w-pad-1 {
    // border: 1px solid #999;
    padding: 10px 10px;
    background-color: #fff;
}
</style>
