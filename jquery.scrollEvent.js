/**
 * jQuery.scrollEvent.js
 *
 * @author Pavel Kulbakin
 * @version 1.0.0
 * @license MIT
 *
 * Introduce scrollstart, scrollstop, scrolldown ans scrollup events
 */
 
(function (factory) {
    if (typeof define === "function" && define.amd) {
        /** AMD. Register as an anonymous module. */
        define(["jquery"], factory);
    } else if (typeof module === "object" && module.exports) {
        /** Node/CommonJS */
        module.exports = factory(require("jquery"));
    } else {
        /** Browser globals */
        factory(window.jQuery);
    }
}(function ($) {
    var scrollEvent = "touchmove scroll";

    // setup new event shortcuts
    $.each(["scrollstart", "scrollstop", "scrolldown", "scrollup"], function (i, name) {

        $.fn[name] = function (fn) {
            return fn ? this.bind(name, fn) : this.trigger(name);
        };

        // jQuery < 1.8
        if ($.attrFn) {
            $.attrFn[name] = true;
        }
    });

    function triggerCustomEvent(obj, eventType, event, bubble) {
        var originalType = event.type;
        event.type = eventType;
        if (bubble) {
            $.event.trigger(event, undefined, obj);
        } else {
            $.event.dispatch.call(obj, event);
        }
        event.type = originalType;
    }

    // also handles scrollstop, scrolldown, scrollup
    $.event.special.scrollstart = {
        setup: function () {
            var thisObject = this,
                $this = $(thisObject),
                scrolling,
                timer,
                scrollTop;

            function trigger(event, state) {
                scrolling = state;
                triggerCustomEvent(thisObject, scrolling ? "scrollstart" : "scrollstop", event);
            }

            // iPhone triggers scroll after a small delay; use touchmove instead
            $this.bind(scrollEvent, function (event) {
                if ( ! scrolling) {
                    trigger(event, true);
                }

                var st = $this.scrollTop();
                if (null !== scrollTop && 0 != st - scrollTop) {
                    triggerCustomEvent(thisObject, 0 < st - scrollTop? "scrolldown" : "scrollup", event);
                }
                scrollTop = st;

                clearTimeout(timer);
                timer = setTimeout(function () {
                    trigger(event, false);
                    scrollTop = null;
                }, 50);
            });
        },
        teardown: function () {
            $(this).unbind(scrollEvent);
        }
    };

    $.each(["scrollstop", "scrolldown", "scrollup"], function (i, event) {
        $.event.special[event] = {
            setup: function() {
                $(this).bind("scrollstart", $.noop);
            },
            teardown: function () {
                $(this).unbind("scrollstart");
            }
        };
    });
}));
