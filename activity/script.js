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
                    let cell = {
                        value: "",
                        formula: "",
                        downstream: [],
                        upstream: [],
                        fontFamily: "Arial",
                        fontSize: 12,
                        bold: false,
                        underline: false,
                        italic: false,
                        bgColor: "#FFFFFF",
                        textColor: "#000000",
                        halign: "left",
                    };
                    $(cells[j]).html("");
                    $(cells[j]).html(cell.value);
                    $(cells[j]).css("font-family", cell.fontFamily);
                    $(cells[j]).css("font-size", cell.fontSize + "px");
                    $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
                    $(cells[j]).css(
                        "text-decoration",
                        cell.underline ? "underline" : "none"
                    );
                    $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
                    $(cells[j]).css("background-color", cell.bgColor);
                    $(cells[j]).css("color", cell.textColor);
                    $(cells[j]).css("text-align", cell.halign);
                    row.push(cell);
                }
                db.push(row);
            }
            console.log(db);
            $($("#grid .cell")[0]).trigger("click");
        });

        $("#Save").on("click", async function () {
            // first time save / file name =? create => data save
            //
            let sdb = await dialog.showOpenDialog();
            let jsonData = JSON.stringify(db);
            fs.writeFileSync(sdb.filePaths[0], jsonData);
            console.log("File Saved");
        });

        $("#Open").on("click", async function () {
            let sdb = await dialog.showOpenDialog();
            let buffContent = fs.readFileSync(sdb.filePaths[0]);
            db = JSON.parse(buffContent);

            let rows = $("#grid").find(".row");
            for (let i = 0; i < rows.length; i++) {
                let cells = $(rows[i]).find(".cell");

                for (let j = 0; j < cells.length; j++) {
                    let cell = db[i][j];
                    $(cells[j]).html("");
                    $(cells[j]).html(cell.value);
                    $(cells[j]).css("font-family", cell.fontFamily);
                    $(cells[j]).css("font-size", cell.fontSize + "px");
                    $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
                    $(cells[j]).css(
                        "text-decoration",
                        cell.underline ? "underline" : "none"
                    );
                    $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
                    $(cells[j]).css("background-color", cell.bgColor);
                    $(cells[j]).css("color", cell.textColor);
                    $(cells[j]).css("text-align", cell.halign);
                }
            }
            console.log("File Opened");
        });

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




        $("#formula-input").on("blur", function () {
            let cellAddress = $("#address-input").val();
            let {
                rowId,
                colId
            } = getRcFAddr(cellAddress);
            let cellObject = getCellObject(rowId, colId);
            // set formula property
            // i 
            // isFormulaValid($(this).html(), cellObject)

            if (cellObject.formula == $(this).val()) {
                return;
            }

            if (cellObject.formula) {
                removeFormula(cellObject, rowId, colId)
            }

            cellObject.formula = $(this).val();
            // evaluate formula
            let rVal = evaluate(cellObject);

            setupFormula(rowId, colId, cellObject.formula);
            updateCell(rowId, colId, rVal);
        })

        function evaluate(cellObject) {
            // ( A1 + A2 )
            let formula = cellObject.formula;
            console.log(formula);
            let formulaComponent = formula.split(" ");
            // ["(","A1",+,"A2",")"]
            for (let i = 0; i < formulaComponent.length; i++) {
                let code = formulaComponent[i].charCodeAt(0);
                // if cell
                if (code >= 65 && code <= 90) {
                    let parent = getRcFAddr(formulaComponent[i]);
                    let parentObj = db[parent.rowId][parent.colId];
                    let value = parentObj.value;
                    formula = formula.replace(formulaComponent[i], value);
                }
            }
            // (10 + 20 ) 
            console.log(formula);
            // infix evaluation
            let rVal = eval(formula);
            console.log(rVal);
            return rVal;

        }

        function updateCell(rowId, colId, rVal) {
            let cellObject = getCellObject(rowId, colId);
            cellObject.value = rVal;
            $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html(rVal);

            for (let i = 0; i < cellObject.downstream.length; i++) {
                let sdsorc = cellObject.downstream[i];
                let fdso = getCellObject(sdsorc.rowId, sdsorc.colId);
                let rVal = evaluate(fdso);
                updateCell(sdsorc.rowId, sdsorc.colId, rVal)
            }
        }

        function getCellObject(rowId, colId) {
            return db[rowId][colId];
        }


        function init() {
            $("#New").trigger("click");
        }
        init()

    }
)