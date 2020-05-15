const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;
$(document).ready(
    function () {

        $("#grid .cell").on("click", function () {
            // let cCell=this
            let ri = Number($(this).attr("ri"));
            let ci = Number($(this).attr("ci"));
            let Address = String.fromCharCode(65 + ci) + (ri + 1);
            let cellObject = getCellObject(ri, ci);
            $("#address-input").val(Address);
            $("#formula-input").val(cellObject.formula);
        })

        function init() {
            $("#New").trigger("click");
        }
        init()

    }
)