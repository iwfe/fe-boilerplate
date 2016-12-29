export default {
    init: function (_container){
        var self = this;
        var container = _container,
            $right = $('.header-right'),
            $headWrap = $(".iwjw-wrap");


        $headWrap.on('click', '.suspend-report', function(event) {
            if ($(this).hasClass('see-house')) {
                $.jps.trigger('log', {
                    type: 'clickEvent',
                    act_k: 151,
                    act_v: 'schedule'
                })
            }
            if ($(this).hasClass('appoint-see')) {
                $.jps.trigger('log', {
                    type: 'clickEvent',
                    act_k: 151,
                    act_v: 'atmlist'
                })
            }
        });

        //登录
        $right.on('click', '.login', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 200,
                act_v: 1
            });
        });

        container.on('click', '.nav-item > a', function() {
            var act_v = $(this).parent().data('log');
            if (act_v!='newhouse') {
                $.jps.trigger('log', {
                    type: 'clickEvent',
                    act_k: 151,
                    act_v: act_v
                })
            }
        })

        $right.on('click', '.user-item-payorder', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 220,
                act_v: 'myorder'
            })
        })

        container.on('click', '#navMyAgent', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 154,
                act_v: 'show'
            })
        })

        //头部消息埋点  地图页列表页头部特殊，container要重新选择
        // $right.on('click', '.message,.cart-tips-message', function() {
        //     $.jps.trigger('log', {
        //         type: 'clickEvent',
        //         act_k: 160,
        //         act_v: 'show'
        //     })
        // });

        // container.on('click', '.user-item.remind', function() {
        //     $.jps.trigger('log', {
        //         type: 'clickEvent',
        //         act_k: 160,
        //         act_v: 'hint'
        //     })
        // });
        // container.on('click', '.user-item.notice', function() {
        //     $.jps.trigger('log', {
        //         type: 'clickEvent',
        //         act_k: 160,
        //         act_v: 'notice'
        //     })
        // });

        $right.on('click', '.see-list', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'atmlist'
            })
        });

        container.on('click', '.see-schedule', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'schedule'
            })
        });
        $right.on('click', '#FollowDynamic', function() {
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'myconcern'
            })
        });
    }
}