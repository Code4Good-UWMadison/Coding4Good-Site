var isActing = false;

function clickUp(new_event_id) {
    if (!isActing) {
        let $top_stack = $(".top-stack");
        let $bot_stack = $(".bot-stack");
        moveSlides(-1, $bot_stack, $top_stack, new_event_id + 1);
    }
}

function clickDown(new_event_id) {
    if (!isActing) {
        let $top_stack = $(".top-stack");
        let $bot_stack = $(".bot-stack");
        moveSlides(1, $top_stack, $bot_stack, new_event_id - 1);
    }
}

function updateInfo(direction, curr_event_id) {
    let $old_info = $("#info" + (curr_event_id - direction));
    let $curr_info = $("#info" + curr_event_id);
    $old_info.fadeOut(function () {
        $curr_info.fadeIn();
    });
}

function disable() {
    isActing = true;
}

function enable() {
    isActing = false;
}

function moveSlides(direction, new_stack, old_stack, curr_event_id) {
    disable();
    let $curr_img = $("#event" + curr_event_id);
    let $cover_flow = $(".cover-flow");

    let oldHeight = $curr_img.height();
    let oldWidth = $curr_img.width();
    let oldPos = $(".center-stack").position();

    $curr_img.appendTo($cover_flow);
    $curr_img.css({"left": oldPos.left, "top": oldPos.top, position: 'absolute'});
    $curr_img.height(oldHeight);
    $curr_img.width(oldWidth);

    $curr_img.animate({
        "top": new_stack.position().top,
        "left": new_stack.position().left + parseInt(new_stack.css('marginLeft')),
        "height": new_stack.height(),
        "width": new_stack.width()
    }, 900, function () {
        $curr_img.appendTo(new_stack);
        $curr_img.css({"top": "", "left": "", "height": "", "width": "", "position": ""});
    });

    if (direction === 1) {
        $curr_img.attr("onclick", "clickUp(" + curr_event_id + ")").bind("click");
    } else {
        $curr_img.attr("onclick", "clickDown(" + curr_event_id + ")").bind("click");
    }

    curr_event_id += direction;
    updateInfo(direction, curr_event_id);
    let $next = $("#event" + curr_event_id);

    let nextOldHeight = $next.height();
    let nextOldWidth = $next.width();
    let nextOldPos = old_stack.position();

    $next.appendTo($cover_flow);
    $next.css({"left": nextOldPos.left + parseInt(new_stack.css('marginLeft')), "top": nextOldPos.top, position: 'absolute'});
    $next.height(nextOldHeight);
    $next.width(nextOldWidth);

    $next.animate({"top": oldPos.top, "left": oldPos.left, "height": oldHeight, "width": oldWidth}, 900, function () {
        $next.appendTo($(".center-stack"));
        $next.css({"top": "", "left": "", "height": "", "width": "", "position": ""});
        $next.attr("onclick", "").unbind("click");
        enable();
    });
}
