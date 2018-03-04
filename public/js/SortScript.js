//Preconditions see sortTable conditions
// <summary>
// Sorts a table, toggling between ascending and descending order.
// </summary>
// <param name="tableId"> The ID of the table to sort</param>
// <param name="index"> The field index to sort by - Note: it must match the header of the table </param>
var curOrder = 0;
var curIndex = 0;

function toggleSort(tableId, index) {
  if (curIndex != index) {
    curIndex = index;
  }
  if (curOrder === 0) {
    curOrder = 1;
  } else {
    curOrder = -curOrder;
  }
  sortTable(tableId, curIndex, curOrder);
}

//Precondition:  You must create/generate headers for your table.
//Note:  The headers you create/generate will be used for sorting the table.

// <summary>
// Sorts a table based on a field and ascending/descending order
// </summary>
// <param name="tableId"> The ID of the table to sort</param>
// <param name="value"> The field name to sort by - Note: it must match the header of the table </param>
// <param name="order"> ascending = 1, descending = -1 </param>
function sortTable(tableId, index, order) {
  try {
    if ($.isNumeric(order)) {
      order = parseInt(order);
    }
    var $rows = $('#' + tableId + ' > tbody > tr');
    //check if the html content is a date
    var isDate = false;
    var count = 0;
    for (var i = 0; i < $rows.length; i++) {
      var $checkVar = $.trim($rows.eq(i).children().eq(index).html()).toLowerCase();
      if ($checkVar.charAt(1) == '/' || $checkVar.charAt(2) == '/' && $checkVar.charAt(3) == '/' || $checkVar.charAt(4) == '/' || $checkVar.charAt(5) == '/') {
        count++;
      }
    }

    if (count >= $rows.length * 0.8) {
      isDate = true;
    }
    if (isDate) {
      $rows.sort(sortByDate);
    }
    else {
      $rows.sort(sortByNumStr);
    }

    //rearrange the table
    $('#' + tableId + ' > tbody').html($rows);

    //sort function properties
    function sortByNumStr(a, b) {
      $a = $(a).children().eq(index).html();
      $b = $(b).children().eq(index).html();
      if ($.isNumeric($a) && $.isNumeric($b)) {
        var a1 = Number.parseInt($a);
        var b1 = Number.parseInt($b);
      }
      else {
        var a1 = $a.toLowerCase();
        var b1 = $b.toLowerCase();
      }
      if (a1 > b1) {
        return 1 * order;
      } else if (a1 < b1) {
        return -1 * order;
      } else {
        return 0;
      }
    }

    function sortByDate(a, b) {
      $a = $(a).children().eq(index).html();
      $b = $(b).children().eq(index).html();
      var a1 = new Date($a);
      var b1 = new Date($b);
      if (!isNaN(a1) && !isNaN(b1)) {
        if (a1 > b1 || isNaN(b1)) {
          return 1 * order;
        } else if (a1 < b1 || isNaN(a1)) {
          return -1 * order;
        } else {
          return 0
        }
      }
      else {
        a1 = $a.toLowerCase();
        b1 = $b.toLowerCase();
        if (a1 > b1) {
          return 1 * order;
        } else if (a1 < b1) {
          return -1 * order;
        } else {
          return 0;
        }
      }
    }
  }
  catch (err) {
    console.log(err);
    // LogErrorScript(err.message, "SortScript.sortTable");
  }
}
