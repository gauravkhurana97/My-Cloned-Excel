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

        $("#Save").on("click", async function () {
            let sdb = await dialog.showOpenDialog();
            let jsonData = JSON.stringify(db);
            fs.writeFileSync(sdb.filePaths[0], jsonData);
            console.log("File Saved")
        })

        $("#Open").on("click", async function () {
            let sdb = await dialog.showOpenDialog();
            let buffContent = fs.readFileSync(sdb.filePaths[0]);
            db = JSON.parse(buffContent);

            let rows = $("#grid").find(".row");
            for (let i = 0; i < rows.length; i++) {
                let cells = $(rows[i]).find(".cell");

                for (let j = 0; j < cells.length; j++) {
                    $(cells[j]).html(db[i][j].value);
                }
            }
            console.log("File Opened");
        })

        function getRcFAddr(cellAddress) {
            let colId = cellAddress.charCodeAt(0) - 65;

            let row = cellAddress.substring(1);
            let rowId = Number(row) - 1;
            return {
                colId,
                rowId
            };
        }
        // Update
        // => when you enter anything who shoul put an entry inside db 
        $("#grid .cell").on("keyup", function () {

            let ri = Number($(this).attr("ri"));
            let ci = Number($(this).attr("ci"));
            let cellObject = getCellObject(ri, ci);

            // if ($(this).html() == cellObject.value) {
            //     return;
            // },
            if (cellObject.formula) {
                removeFormula(cellObject, ri, ci);
            }

            // console.log(ri + " " + ci)
            // db[ri][ci].value = $(this).html();
            updateCell(ri, ci, $(this).html())
            // console.log(db);
        })


        function init() {
            $("#New").trigger("click");
        }
        init()

    }
)