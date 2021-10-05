function show_modal(title='Warning', msg, todo) {
    $('#modal-todo').unbind('click');
    $("#modal-warning-title").text(title);
    $("#modal-warning-msg").text(msg);
    $("#modal-todo").click(todo);
    $("#modal-confirmation-box").modal('show');
}
