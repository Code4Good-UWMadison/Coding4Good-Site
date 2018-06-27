$(function(){
    $('input.searchable').on("change textInput input", function () {
        search(this.value);
    });
})


//<summary>
// Search a table for
// 1.  a given value - partial and equality
// 2.  multiple values - last value will be tested for partial and equality, other values will be tested for equality
// (Format of value - equality,equality,search a full equality sentence,partial) Note: no spaces in between value and commas
// </summary>
// <param name="tableId"> The table ID to search</param>
// <param name="value"> The value(s) to search for</param>
// <result>Positive search results will be visible</result>
function search(value) {
  try {
    $('table.searchable > tbody > tr').show();
    var params = value.split(',');
    for (var param = 0; param < params.length; param++) {
      if (params[param] != "") {
        var $rows = $('table.searchable > tbody > tr').filter(":visible");
        for (var i = 0; i < $rows.length; i++) {
          var $dataValue = $rows.eq(i).children();
          var match = false;
          for (var data = 0; data < $dataValue.length; data++) {
            var $dataHtml = $.trim($dataValue.eq(data).html());
            if (param != params.length - 1) {
              if ($dataHtml.toLowerCase() == params[param].toLowerCase()) {
                match = true;
              }
            }
            else if ($dataHtml.toLowerCase().includes(params[param].toLowerCase())) {
              match = true;
            }
          }
          if (!match) {
            $rows.eq(i).hide();
          }
          else {
            $rows.eq(i).show();
          }
        }
      }
    }
  }
  catch (err) {
    console.log(err);
    // LogErrorScript(err.message, "SearchScript.search")
  }
}

//<summary>
// Search a table for a date range
// </summary>
// <param name="tableId"> The table ID to search</param>
// <param name="date1"> The starting date</param>
// <param name="date2"> The ending date</param>
// <result>Positive search results will be visible</result>
// Note:  date input format "mm/dd/yyyy 12:00:00 XM"
function searchDateRange(tableId, date1, date2) {
  try {
    if (date1 != "" || date2 != "") {
      if (date1 != "") {
        date1 = parseDateTime(date1);
      }
      if (date2 != "") {
        date2 = parseDateTime(date2);
      }
      if (date1 != "" && date2 != "" && date1 > date2) {
        var temp = date2;
        date2 = date1;
        date1 = temp;
      }
      var $rows = $('#' + tableId + ' > tbody > tr').filter(":visible");
      for (var i = 0; i < $rows.length; i++) {
        var $dataValue = $rows.eq(i).children();
        var match = false;
        for (var data = 0; data < $dataValue.length; data++) {
          var $dataHtml = $.trim($dataValue.eq(data).html()).toLowerCase();
          if ($dataHtml.includes('/') && $dataHtml.includes(' ') && $dataHtml.includes(':')) {
            var stringfound = parseDateTime($dataHtml);
            if (date2 != "") {
              if (stringfound <= date2)
                match = true;
              if (date1 != "") {
                if (stringfound <= date1)
                  match = false;
              }
            }
            else if (date1 != "") {
              if (stringfound >= date1)
                match = true;
            }
          }
        }
        if (!match) {
          $rows.eq(i).hide();
        }
        else {
          $rows.eq(i).show();
        }
      }
    }
  }
  catch (err) {
    LogErrorScript(err.message, "SearchScript.searchDateRange")
  }
}

//<summary>
// Parse a date
// </summary>
// <param name="dateTime"> The date to parse</param>
// <return>A parsed date</result>
// Note:  date input format "mm/dd/yyyy 12:00:00 XM"
function parseDateTime(dateTime) {
  try {
    var string = dateTime.toLowerCase().split(' ')[0];
    var parse = string.split('/');
    if (parse[0].length == 1)
      parse[0] = "0" + parse[0];
    if (parse[1].length == 1)
      parse[1] = "0" + parse[1];
    string = parse[2] + parse[0] + parse[1];
    return string;
  }
  catch (err) {
    LogErrorScript(err.message, "SearchScript.parseDateTime")
  }
}
