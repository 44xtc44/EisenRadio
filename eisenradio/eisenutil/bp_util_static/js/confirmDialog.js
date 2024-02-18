"use strict";
/**
* Reusable confirmation dialog. Injects all tags with styles into DOM.
* Will insert the dialog between two elements, or end of parent.
* OK or Cancel press leads to "event listener is gone".
* Instantiated, it looks like so.
*     <div id="divConfirmDialog">
*         <p id="pConfirmDialogText"></p>
*         <div id="btnConfirm">
*             <div id="btnOK" class="btnOK"></div>
*             <div id="btnCancel" class="btnCancel"></div>
*         </div>
*     </div>
* window.confirm = new ConfirmDialog();
* confirm.btnOrder(ajaxDelDB, confirm, <optional arg>);
* confirm.dialogText("Confirm to remove the DB!");
* confirm.dialogShowUnder("delDatabaseButton");
*/
class ConfirmDialog{
  constructor() {
    this.isEventSet = false;
    this.customParent = undefined;
    this.dialogId = "divConfirmDialog";
    this.dialog = undefined;  // document.getElementById("divConfirmDialog");
    this.btnDivId = "btnConfirm";
    this.btnDiv = undefined;  // document.getElementById("btnConfirm");
    this.textShowId = "pConfirmDialogText";
    this.textShow = undefined;  //  document.getElementById("pConfirmDialogText");
    this.btnOK = "btnOK";
    this.ok = undefined;
    this.btnCancel = "btnCancel";
    this.cancel = undefined;
    this.btnClassId = "btnConfirm";
    this.btnClass = undefined;

    this.createDialog();
    this.drawButtons();
  }
  drawButtons() {
    this.appendDiv( {
      id: this.btnOK,
      elemClass: this.btnClassId,
      parent: this.btnDiv,
      innerHTML: "OK"
    } );
    this.appendDiv( {
      id: this.btnCancel,
      elemClass: this.btnClassId,
      parent: this.btnDiv,
      innerHTML: "Cancel"
    } );
    this.ok = document.getElementById(this.btnOK);
    this.cancel = document.getElementById(this.btnCancel);
  }
  createDialog() {
    /* Default tags must exist in every HTML page, we want to call.
    * <div id="divConfirmDialog">
    *     <p id="pConfirmDialogText"></p>
    *     <div id="btnConfirm"></div>
    * </div>
    */
    this.dialog = document.createElement('div');
    this.btnDiv = document.createElement('div');
    this.textShow = document.createElement('p');
    this.dialog.id = this.dialogId;
    this.btnDiv.id = this.btnDivId;
    this.textShow.id = this.textShowId;

    document.body.appendChild(this.dialog);
    this.dialog.appendChild(this.textShow);  // order matters
    this.dialog.appendChild(this.btnDiv);
  }
  styleDialogText() {
    this.textShow.style.marginLeft = "20px";
    this.textShow.style.width = "200px";
    this.textShow.style.fontFamily = "Roboto, Helvetica, Arial";
    this.textShow.style.fontWeight = "bold";
    this.textShow.style.textAlign = "center";
  }
  styleDialogButtons() {
    this.btnClass = document.getElementsByClassName(this.btnClassId);
    for(let idx = 0; idx < this.btnClass.length; idx++) {
      this.btnClass[idx].style.width = "200px";
      this.btnClass[idx].style.marginLeft = "20px";
      this.btnClass[idx].style.marginBottom = "20px";
      this.btnClass[idx].style.color = "lightYellow";
      this.btnClass[idx].style.fontFamily = "Roboto, Helvetica, Arial";
      this.btnClass[idx].style.fontWeight = "bold";
      this.btnClass[idx].style.textAlign = "center";
      this.btnClass[idx].style.cursor = "pointer";
      this.btnClass[idx].style.border = "1px solid #aaa";
      this.btnClass[idx].style.boxShadow = "0 2px 0 1px rgba(0,0,0,.04)";
    }
    this.ok.style.backgroundColor = "green";
    this.cancel.style.backgroundColor = "red";
  }
  /* Method can insert the dialog between two elements, i.e button and description.
  * The point here is to "insert" into the child list, not to "add" a node.
  */
  dialogShowUnder(customParentId) {
    let parent = document.getElementById(customParentId);
    parent.parentNode.insertBefore(this.dialog, parent.nextSibling);
    // styles
    this.styleDialogText();
    this.styleDialogButtons();
    this.dialog.style.display = "block";
  }
  btnHide() {
    this.removeDiv( {elem: this.btnDiv} );  // del button divs with event listener
  }
  dialogHide() {
    this.dialog.style.display = "none";
  }
  dialogText(text) {
    this.textShow.innerText = text;
  }
  btnOrder(ref, callback, args) {
    if(this.isEventSet) return;  // else could set multiple listener
    this.ok.addEventListener("click", (e) => {
      setTimeout( () => {
        if(!args) {
          ref(callback);  // btnOrder = delDatabase; fun reference; run delDatabase()
        }else {
          ref(args, callback);
        }
        this.btnHide();
      }, 10);
    });
    this.cancel.addEventListener("click", (e) => {
      setTimeout( () => {
        this.btnHide();
        this.dialogHide();
      }, 10);
    });
    this.isEventSet = true;
  }
  appendDiv(opt) {
    /* Reusable fun to stack div and use the stack as a list.  */
    if(opt.id === null || opt.id === undefined) return;
    if (opt.elemClass === undefined) opt.elemClass = "foo";
    if (opt.innerHTML === undefined) opt.innerHTML = "";
    let div = document.createElement('div');
    div.id = opt.id;
    div.classList.add(opt.elemClass);
    div.innerHTML = opt.innerHTML;
    opt.parent.appendChild(div);  // parent is full path document.getElem...
  }
  removeDiv(opt) {
    if(opt.elem === null || opt.elem === undefined) return;
    while (opt.elem.firstChild) {
      opt.elem.removeChild(opt.elem.lastChild);
    }
  }
}
