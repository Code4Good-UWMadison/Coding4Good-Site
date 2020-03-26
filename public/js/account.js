$(function () {
  $.ajax({
    url: "/account_check",
    method: "GET",
    dataType: "json",
    data: {},
    success: function (data) {
      if (data.id != -1) {
        var displayingName = data.fullname;
        let maxLength = 14;
        // if the name is very long, change the way of displaying the image
        if (displayingName.length > maxLength) {
          var res = displayingName.split(" ");
          displayingName = "";
          var currentLength = 0;
          if (res[0].length < 14) {
            res.forEach(function (sub) {
              currentLength += sub.length;
              if (currentLength > maxLength - 3) {
                displayingName += " ";
                displayingName += sub.charAt(0);
                displayingName += ".";
                return;
              }
              displayingName += sub;
              displayingName += " ";
            });
          } else {
            displayingName = data.fullname.slice(0, 12);
            displayingName += ".";
          }
        }
        $(".navbar-right").html(`<ul class="nav navbar-nav">
          <li><a>Welcome! ` + displayingName + `</a></li>
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
