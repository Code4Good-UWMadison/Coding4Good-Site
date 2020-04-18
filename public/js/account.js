$(function () {
  $.ajax({
    url: "/account_check",
    method: "GET",
    dataType: "json",
    data: {},
    success: function (data) {
      if (data.id != -1) {
        var display_name = data.fullname;
        let maxLength = 14;
        // if the name is very long, change the way of displaying the name
        if (display_name.length > maxLength) {
          var res = display_name.split(" ");
          display_name = "";
          var currentLength = 0;
          if (res[0].length < 14) {
            res.forEach(function (sub) {
              currentLength += sub.length;
              if (currentLength > maxLength - 3) {
                display_name += " ";
                display_name += sub.charAt(0);
                display_name += ".";
                return;
              }
              display_name += sub;
              display_name += " ";
            });
          } else {
            display_name = data.fullname.slice(0, 12);
            display_name += ".";
          }
        }
        $(".navbar-right").html(`<ul class="nav navbar-nav">
          <li><a>Welcome! ` + display_name + `</a></li>
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
