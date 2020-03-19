$(function () {
  $.ajax({
    url: "/account_check",
    method: "GET",
    dataType: "json",
    data: {},
    success: function (data) {
      if (data.id != -1) {
        var displaynName = data.fullname;
        let maxLength = 14;
        // if the name is very long, change the way of displaying the image
        if (displaynName.length > maxLength) {
          var res = displaynName.split(" ");
          displaynName = "";
          var currentLength = 0;
          if (res[0].length < 14) {
            res.forEach(function (sub) {
              currentLength += sub.length;
              if (currentLength > maxLength - 3) {
                displaynName += " ";
                displaynName += sub.charAt(0);
                displaynName += ".";
                return;
              }
              displaynName += sub;
              displaynName += " ";
            });
          } else {
            displaynName = data.fullname.slice(0, 12);
            displaynName += ".";
          }
        }
        console.log(displaynName);
        $(".navbar-right").html(`<ul class="nav navbar-nav">
          <li><a>Welcome! ` + displaynName + `</a></li>
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
