// Make currently visited page into set modes //
// ------ line below ------- SOURCE: https://lukelowrey.com/css-variable-theme-switcher/

var storedTheme = sessionStorage.getItem('theme') || curTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme)
  sessionStorage.setItem('theme', storedTheme);

  // Move sphere to indicate saved mode is dark
  if (storedTheme == "dark") {
    document.querySelectorAll('.ball')[0].style.transform = 'translateX(24px)';
  }
}

var storedHint = sessionStorage.getItem('hint-mode') || curHint;
  if (storedHint === "no-hint") {
    document.querySelectorAll('.ball')[1].style.transform = 'translateX(24px)';
  }

// Fade in + fade out confirmation text 
function confirmAddText() {
  $("#fading-text").fadeIn('fast').delay(1500).fadeOut('fast');
}


const intoAdd = `
  <div class="form-group inline">
    <select id="question_type" class="form-control dropdown" required>
      <option disabled selected value="">Question Type</option>
      <option class="dropdown" value="True and False">True and False</option>
      <option class="dropdown" value="Fill In The Blank">Fill In The Blank</option>
      <option class="dropdown" value="Multiple Choice">Multiple Choice</option>
      <option class="dropdown" value="Dropdown">Dropdown</option>
    </select>
  </div>
  <div class="form-group inline">
      <input autocomplete="off" id="addQinput" autofocus class="form-control toAdd" name="question" placeholder="Question" type="text" required>
  </div>  
  <!-- Content below in dependent changes based on type of question chosen -->
  <div id="dependent"></div>
  <p id="fading-text">Added!</p>
`;

document.getElementById("addQdiv").innerHTML = intoAdd;

// TABLE STRUCTURE F(X) /////////////////////////////////////////////////////////////////////////////////////////
// Sort qBank //
function compareObjects(object1, object2, key) {
  const obj1 = object1[key].toUpperCase();
  const obj2 = object2[key].toUpperCase();

  if (obj1 < obj2) {
    return -1
  }
  if (obj1 > obj2) {
    return 1
  }
  return 0
}

function compareObjTimes(a, b) {
  return b.id - a.id
}

// Default sort (newest at the top)
var sorted = "Date Added";

function doSort() {
  qBank.sort((row1, row2) => {
    if (sorted === "Question") {
      return compareObjects(row1, row2, 'question')
    }
    else if (sorted === "Type") {
      return compareObjects(row1, row2, 'question_type')
    }
    else if (sorted === "Date Added") {
      return compareObjTimes(row1, row2)
    }
  })
}


// Add rows in question bank table //
function makeTable() {
  var to_table_html = "";
  for (var q = 0; q < qBank.length; q++) {
    to_table_html += `
    <tr id="row${qBank[q]["id"]}">
      <td>${qBank[q]["question_type"]}</td>
      <td>${qBank[q]["question"]}</td>
      <td>${qBank[q]["answer"]}</td>
      <td>${qBank[q]["hint"]}</td>
      <td>${qBank[q]["a"]}</td>
      <td>${qBank[q]["b"]}</td>
      <td>${qBank[q]["c"]}</td>
      <td>${qBank[q]["d"]}</td>
      <td><button type="button" class="btn btn-warning editQ" id="edit${qBank[q]["id"]}" data-toggle="modal" data-target="#editQmodal">EDIT</button></td>
      <td>
          <i class="del-question fa fa-trash fa-2x" data-toggle="modal" data-target="#confirmDelQ">
              <button class="del-btn" value=${qBank[q]["id"]}></button>
          </i>
      </td>
      <td><div class="form-check multi-del"><input class="form-check-input multi-sel-check" type="checkbox" name="sel${qBank[q]["id"]}"></div></td>
    </tr>
    `;
  }
  document.getElementById("qBankBody").innerHTML = to_table_html;
};

// Make table for the first time
makeTable();


document.addEventListener('DOMContentLoaded', function() {
  // SWITCH MODES /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Switch mode - theme //
  document.getElementById("bg-mode").onclick = function() {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    var targetTheme = "light";

    // Move the white sphere button to show mode has been changed
    if (currentTheme === "light") {
        targetTheme = "dark";
        document.querySelectorAll('.ball')[0].style.transform = 'translateX(24px)';
    }
    else {
      document.querySelectorAll('.ball')[0].style.transform = 'translateX(0px)';
    }

    document.documentElement.setAttribute('data-theme', targetTheme)
    sessionStorage.setItem('theme', targetTheme);
  };


  // Switch mode - hints //
  const chk = document.getElementById('chk');

  // Move the white sphere button to show mode has been changed
  chk.addEventListener('change', () => {
    if (chk.checked === true) {
      document.querySelectorAll('.ball')[1].style.transform = 'translateX(24px)';
      sessionStorage.setItem('hint-mode', "no-hint");
    }
    else {
      console.log("hint back!")
      document.querySelectorAll('.ball')[1].style.transform = 'translateX(0px)';
      sessionStorage.setItem('hint-mode', "yes-hint");
    }
  });
    
  // Save current modes as values in a form within logout btn to be saved in user database //
  var logoutBtn = document.getElementById("logout");
  logoutBtn.onclick = function() {
    to_value = sessionStorage.getItem('theme') + " " + sessionStorage.getItem('hint-mode');
    logoutBtn.value = to_value;
    sessionStorage.clear();
  };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // ADD QUESTIONS /////////////////////////////////////////////////////////////////////////////////////////////////////////
  var addQuestion = {'id': "", 'question_type': "", "question": "", "answer": "", "hint": "", "a": "", "b": "", "c": "", "d": ""};

  function addingQType(e) {
    var type = e.target.value;
    addQuestion['question_type'] = type;
    if (type === "Multiple Choice" || type === "Dropdown") {
      var to_html = `
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" id="addAnswer" name="answer" placeholder="Answer" type="text" required>
        </div>
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" id="addA" name="a" placeholder="Option 1" type="text" required>
        </div>
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" id="addB" name="b" placeholder="Option 2" type="text" required>
        </div>
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" id="addC" name="c" placeholder="Option 3" type="text" required>
        </div>
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" id="addD" name="d" placeholder="Option 4" type="text" required>
        </div>
      `;
    }
    else if (type === "True and False") {
      var to_html = `
        <div class="form-group inline">
          <select name="answer" class="form-control dropdown toAdd" id="addAnswer">
            <option disabled selected value="">Answer</option>
            <option class="dropdown" value="TRUE">True</option>
            <option class="dropdown" value="FALSE">False</option>
          </select>
        </div>
      `;
    }
    else if (type === "Fill In The Blank"){
      var to_html = `
        <div class="form-group inline">
            <input autocomplete="off" autofocus class="form-control toAdd" name="answer" id="addAnswer" placeholder="Answer" type="text" required>
        </div>
        <div class="form-group inline">
          <input autocomplete="off" autofocus class="form-control toAdd" name="hint" placeholder="Hint" type="text">
        </div>
      `;
    }

    document.getElementById("dependent").innerHTML = to_html;

    document.querySelectorAll('.toAdd').forEach(addSect => {
      addSect.addEventListener("keyup", (e) => {
        addQuestion[e.target.name] = e.target.value;
      })
      addSect.addEventListener("click", (e) => {
        addQuestion[e.target.name] = e.target.value;
        console.log(addQuestion[e.target.name])
      })
    })
    // Simulate form confirmation
    document.getElementById("confirmAdd").addEventListener("click", () => {
      if (addQuestion['question_type'] == '') {
        console.log("NEED TYPE");
        return;
      }
      else if (addQuestion['question'] == "") {
        document.getElementById("addQinput").setCustomValidity("Please enter a question");
        document.getElementById("addQinput").reportValidity();
        return;
      }
      else if (addQuestion['answer'] == '') {
        document.getElementById("addAnswer").setCustomValidity("Please enter an answer");
        document.getElementById("addAnswer").reportValidity();
        return;
      }
      else if (addQuestion['question_type'] === "Multiple Choice" || addQuestion['question_type'] === "Dropdown") {
        const choices = [addQuestion['a'], addQuestion['b'], addQuestion['c'], addQuestion['d']];
        const setChoix = new Set(choices);
        if (addQuestion['a'] == "") {
          document.getElementById("addA").reportValidity();
          return;
        }
        else if (addQuestion['b'] == "") {
          document.getElementById("addB").reportValidity();
          return;
        }
        else if (addQuestion['c'] == "") {
          document.getElementById("addC").reportValidity();
          return;
        }
        else if (addQuestion['d'] == "") {
          document.getElementById("addD").reportValidity();
          return;
        }
        else if (choices.length > setChoix.size) {
          console.log("ANSERS MUST BE DISTINCT");
          document.getElementById("addA").setCustomValidity("Options must be distinct");
          document.getElementById("addA").reportValidity();
          return;
        }
        else if (!choices.includes(addQuestion['answer'])) {
          document.getElementById("addAnswer").setCustomValidity("Answer must be one of the options");
          document.getElementById("addAnswer").reportValidity();
          return;
        }
      }
      // Add question to database
      addQuestion['id'] = qBank.length + 3;
      console.log(addQuestion['id']);
      fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "add",
          data: `${JSON.stringify(addQuestion)}`
        })
      }).then(data => data.text()).then(text => console.log(text));

      // Update view for question bank table
      qBank.push(addQuestion)
      addQuestion = {'question_type': "", "question": "", "answer": "", "hint": "", "a": "", "b": "", "c": "", "d": ""};
      doSort();
      makeTable();

      // Clear add questions form
      document.getElementById("addQdiv").innerHTML = intoAdd;
      document.getElementById("question_type").addEventListener("click", (e) => {
        if (e.target.value.length > 0) {
          addingQType(e);
        }
        else {
          console.log("no type chosen!!")
        }
      });

      // Show user confirmation 
      confirmAddText();
    })
  };

  document.getElementById("question_type").addEventListener("click", (e) => {
    if (e.target.value.length > 0) {
      addingQType(e);
    }
    else {
      console.log("no type chosen!!")
    }
  });

  // Edit questions ---- /////////////////////////////////////////////////////////////////////////////////////////////////
  function editQs(e) {
    qid = e.target.id;
    qid = qid.slice(4, qid.length);
    tdChildren = e.target.parentNode.parentNode.children;
    type = tdChildren[0].innerHTML;

    var to_html = `
      <div class="form-group inline">
        <label>Question:</label>
        <input autocomplete="off" value="${tdChildren[1].innerHTML}" autofocus class="form-control" name="question" placeholder="Question" type="text" required>
      </div>  
      <input class="del-btn" value="${qid}" name="qid">
    `;

    if (type === "Multiple Choice" || type === "Dropdown") {
      to_html += `
        <div class="form-group inline">
          <label>Answer:</label>
          <input autocomplete="off" value="${tdChildren[2].innerHTML}" autofocus class="form-control" name="answer" placeholder="Answer" type="text" required>
        </div>
        <div class="form-group inline">
          <label>Option 1:</label>
          <input autocomplete="off" value="${tdChildren[4].innerHTML}" autofocus class="form-control" name="a" placeholder="Option 1" type="text" required>
        </div>
        <div class="form-group inline">
          <label>Option 2:</label>
          <input autocomplete="off" value="${tdChildren[5].innerHTML}" autofocus class="form-control" name="b" placeholder="Option 2" type="text" required>
        </div>
        <div class="form-group inline">
          <label>Option 3:</label>
          <input autocomplete="off" value="${tdChildren[6].innerHTML}" autofocus class="form-control" name="c" placeholder="Option 3" type="text" required>
        </div>
        <div class="form-group inline">
          <label>Option 4:</label>
          <input autocomplete="off" value="${tdChildren[7].innerHTML}" autofocus class="form-control" name="d" placeholder="Option 4" type="text" required>
        </div>
      `;
    }
    else if (type === "True and False") {
      if (tdChildren[2].value === "TRUE") {
        to_html += `
        <div class="form-group inline">
          <label>Answer:</label>
          <select name="answer" class="form-control dropdown" required>
            <option disabled value="">Answer</option>
            <option class="dropdown" selected value="TRUE">True</option>
            <option class="dropdown" value="FALSE">False</option>
          </select>
        </div>
          `;
      }
      else {
        to_html += `
        <div class="form-group inline">
          <label>Answer:</label>
          <select name="answer" class="form-control dropdown" required>
            <option class="dropdown" value="TRUE">True</option>
            <option class="dropdown" selected value="FALSE">False</option>
          </select>
        </div>
          `;
      }
    }
    else if (type === "Fill In The Blank"){
      to_html += `
      <div class="form-group inline">
        <label>Answer:</label>
        <input autocomplete="off" value="${tdChildren[2].innerHTML}" autofocus class="form-control" name="answer" placeholder="Answer" type="text" required>
      </div>
      <div class="form-group inline">
        <label>Hint:</label>
        <input autocomplete="off" value="${tdChildren[3].innerHTML}" autofocus class="form-control" name="hint" placeholder="Hint" type="text">
      </div>
      `;
    }
    document.getElementById("editQdiv").innerHTML = to_html;
    document.getElementById("confirmSave").addEventListener("click", () => {
      doSort();
      makeTable();
    })
  };

  document.querySelectorAll(".editQ").forEach(editBtn => {
    editBtn.addEventListener("click", (e) => {
      editQs(e);
    })
  })


  // Delete questions /////////////////////////////////////////////////////////////////////////////////////////////////////
  const to_del = [];

  var delBtns = document.querySelectorAll(".del-question");
  var multiDel = document.querySelectorAll(".multi-sel-check");
  var multiTrash = document.getElementById("multi-trash");

  for (var j = 0; j < delBtns.length; j++) {
    delBtns[j].addEventListener("click", (e) => {
      var qid = e.target.childNodes[1].value;
      e.target.parentNode.innerHTML += `
      <div class="modal fade" id="confirmDelQ" tabindex="-1" role="dialog" aria-labelledby="confirmDelQTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmDelQTitle">Delete question?</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <strong>This action cannot be undone.</strong>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button id="delOne" class="btn btn-danger" value="${qid}">Yes, delete</button>
            </div> 
          </div>
        </div>
      </div>
      `;

      document.getElementById("delOne").addEventListener("click", (e) => {
        qid = e.target.value;
        console.log("deleting", qid)
        fetch("/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              action: "delete",
              data: `${qid}`
          })
        }).then(data => data.text()).then(text => console.log(text));
        $(`#confirmDelQ`).modal('toggle');
        rowID = "row" + qid;
        document.getElementById(rowID).innerHTML = "";
      })
    })

    multiDel[j].addEventListener("click", (e) => {
      var qidDel = e.target.getAttribute("name").substring(3)
      console.log(qidDel)
      if (e.target.checked) {
        to_del.push(qidDel)
      }
      else {
        const index = to_del.indexOf(qidDel);
        if (index > -1) {
          to_del.splice(index, 1);
        }
      }
      console.log(to_del);
      if (to_del.length === 1) {
        multiTrash.style.display = "block";
      }
      else if (to_del.length === 0) {
        multiTrash.style.display = "none";
      }
    })
  }

  document.getElementById("mulTrashing").addEventListener("click", () => {
    // Send array of question IDs to Flask
    fetch("/", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          action: "delete",
          data: `${to_del}`
      })
    }).then(data => data.text()).then(text => console.log(text));

    // Delete rows from question bank table in view
    for (var k = 0; k < to_del.length; k++) {
      rowID = "row" + to_del[k]
      document.getElementById(rowID).innerHTML = "";
    }
    to_del.length = 0;
    $('#confirmDelQs').modal('toggle');
  })
 

  document.getElementById("sorting").addEventListener("click", () => {
    document.getElementById("sorting").addEventListener("click", (e) => {
      var sortVal = e.target.value;
      console.log(sorted, "to", sortVal);
      if (sorted === sortVal) {
        qBank.reverse();
      }
      else {
        sorted = sortVal;
        doSort();
      }
      makeTable(); 
    })
  });

});