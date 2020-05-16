const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;
$(document).ready(
    function () {
        let db;
        $("#grid .cell").on("click", function () {
            // let cCell=this
            let ri = Number($(this).attr("ri"));
            let ci = Number($(this).attr("ci"));
            let Address = String.fromCharCode(65 + ci) + (ri + 1);
            let cellObject = getCellObject(ri, ci);
            $("#address-input").val(Address);
            $("#formula-input").val(cellObject.formula);
        })

        // New click=> Ui and DB 
        $("#New").on("click", function () {
            db = [];
            let rows = $("#grid").find(".row");
            for (let i = 0; i < rows.length; i++) {
                let cells = $(rows[i]).find(".cell");
                let row = [];
                for (let j = 0; j < cells.length; j++) {
                    $(cells[j]).html("");

                    let cell = {
                        value: "",
                        formula: "",
                        downstream: [],
                        upstream: []
                    }
                    row.push(cell);
                }
                db.push(row);
            }
            console.log(db);
            $($("#grid .cell")[0]).trigger("click");
        })

        function init() {
            $("#New").trigger("click");
        }
        init()

    }
)