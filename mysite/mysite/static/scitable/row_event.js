/*jslint newcap: true */
/*jshint onevar: true */
/*jshint todo: true */
/*jshint qunit: true */
/*jshint jquery: true */
/*jshint yui: true */
/*jslint plusplus: true */
/*jshint onevar: false */
/*global SciSheets, $, alert, YAHOO, SciSheetsUtilEvent */
/*jslint unparam: true*/
/*jslint browser: true */
/*jslint indent: 2 */

function SciSheetsRow(scisheet) {
  "use strict";
  this.scisheet = scisheet;
}

SciSheetsRow.prototype.click = function (oArgs) {
  "use strict";
  var ep, scisheet, processClick, scisheetRow;
  scisheetRow = this;
  scisheet = scisheetRow.scisheet;

  processClick = function (eleId) {
    var msg, cmd, ele;
    msg = "Row '" + ep.rowIndex + "' clicked.";
    msg += " Selected " + eleId + ".";
    console.log(msg);
    cmd = scisheet.createServerCommand();
    cmd.command = eleId;
    cmd.row = ep.rowIndex;
    cmd.columnName = ep.columnName;
    cmd.target = "Row";
    if (cmd.command === 'Insert') {
      scisheet.utilSendAndReload(cmd);
    }
    if (cmd.command === 'Append') {
      scisheet.utilSendAndReload(cmd);
    }
    if (cmd.command === 'Move') {
      // Change the dialog prompt
      ele = $("#moverow-dialog-label")[0].childNodes[0];
      ele.nodeValue = "Move row '" + ep.rowIndex + "': ";
      if (scisheet.mockAjax) {
        scisheet.ajaxCallCount += 1;  // Count as an Ajax call
      }
      $("#moverow-dialog").dialog({
        autoOpen: true,
        modal: true,
        closeOnEscape: true,
        close: function (event, ui) {
          scisheet.utilReload();
        },
        dialogClass: "dlg-no-close",
        buttons: {
          "Submit": function () {
            cmd.args = [$("#moverow-dialog-name").val()];
            $(this).dialog("close");
            scisheet.utilSendAndReload(cmd);
            alert("Pressed Submit");
          },
          "Cancel": function () {
            $(this).dialog("close");
            scisheet.utilReload();
          }
        }
      });
    }
    if (cmd.command === 'Delete') {
      scisheet.utilSendAndReload(cmd);
    }
  };

  ep = new SciSheetsUtilEvent(scisheet, oArgs);
  $(ep.target).effect("highlight", 1000000);
  $(ep.target).toggle("highlight");
  scisheet.utilClick("RowClickMenu", oArgs, processClick);
};
