$(function () {
  $.ajax({
    url: "/account_check",
    method: "GET",
    dataType: "json",
    data: {},
    success: function (data) {
      if (data.id != -1) {
        $(".navbar-right").html(`<ul class="nav navbar-nav">
          <li><a>Welcome! ` + data.fullname + `</a></li>
          <li><a>|</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a>|</a></li>
          <li><a href="/logout">Log out</a></li>
        </ul>`);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseJSON);
    }
  });
});
