/**
 * jQuery.scrollEvent.js
 *
 * @author Pavel Kulbakin
 * @version 1.1.0
 * @license MIT
 *
 * Introduce scrollstart, scrollstop, scrolldown, scrollup, scrolltop, scrollbottom events
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
    $.each(["scrollstart", "scrollstop", "scrolldown", "scrollup", "scrolltop", "scrollbottom"], function(i, name) {

        $.fn[name] = function (fn) {
            return fn ? this.bind(name, fn) : this.trigger(name);
        };

        // jQuery < 1.8
        if ($.attrFn) {
            $.attrFn[name] = true;
        }
    });

    // also handles "scrollstop", "scrolldown", "scrollup", "scrolltop", "scrollbottom"
    $.event.special.scrollstart = {

        enabled: true,
        setup: function () {

            var thisObject = this,
                $this = $(thisObject),
                st = $this.scrollTop(),
                scrolling,
                timer;

            // trigger events at the start or end of scrolling
            function trigger(event, state) {
                var originalEventType = event.type;

                scrolling = state;

                event.type = scrolling ? "scrollstart" : "scrollstop";
                $.event.dispatch.call(thisObject, event);

                if ( ! scrolling) {
                    var p = {
                        st: $this.scrollTop(),
                        ch: $this.prop('clientHeight'),
                        sh: $this.prop('scrollHeight')
                    };

                    if (0 === p.st) {
                        event.type = "scrolltop";
                        $.event.dispatch.call(thisObject, event);
                    }
                    if (p.st >= p.sh - p.ch) {
                        event.type = "scrollbottom";
                        $.event.dispatch.call(thisObject, event);
                    }
                }

                event.type = originalEventType;
            }

            // trigger events during scrolling
            function triggerAlt(event) {
                var originalEventType = event.type;
                var cst = $this.scrollTop();

                event.type = cst > st ? "scrolldown" : "scrollup";
                $.event.dispatch.call(thisObject, event);
                st = cst;

                event.type = originalEventType;
            }

            // iPhone triggers scroll after a small delay; use touchmove instead
            $this.bind(scrollEvent, function (event) {

                if ( ! $.event.special.scrollstart.enabled) {
                    return;
                }

                if ( ! scrolling) {
                    trigger(event, true);
                }

                triggerAlt(event);

                clearTimeout(timer);
                timer = setTimeout(function() {
                    trigger(event, false);
                }, 50);

            });
        },
        teardown: function () {
            $(this).unbind(scrollEvent);
        }
    };

    $.each(["scrollstop", "scrolldown", "scrollup", "scrolltop", "scrollbottom"], function (i, event) {
        $.event.special[event] = {
            setup: function() {
                $(this).bind("scrollstart", $.noop);
            },
            teardown: function() {
                $(this).unbind("scrollstart");
            }
        };
    });

}));
