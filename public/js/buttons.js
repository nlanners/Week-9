document.addEventListener('DOMContentLoaded', bindButtons);

function bindButtons() {
    document.getElementById('newExercise').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        var payload = {
            name:null,
            reps:null,
            weight:null,
            units:null,
            date:null,
            buttonStatus:'new'
        };
        payload.name = document.getElementById('name').value;
        payload.reps = document.getElementById('reps').value;
        payload.weight = document.getElementById('weight').value;
        payload.units = document.getElementById('units').value;
        payload.date = document.getElementById('date').value;

        if(payload.name === '' || payload.name === null){
            alert("Exercise name is required. Please enter an exercise name.");
            event.preventDefault();
            return;
        }

        req.open('POST', '/',true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400) {
                var response = JSON.parse(req.responseText);

                // create new row and fill with data
                var newRow = document.createElement('tr');
                newRow.id = response.row.id;
                var newName = document.createElement('td');
                newName.textContent = response.row.name;
                var newReps = document.createElement('td');
                newReps.textContent = response.row.reps;
                var newWeight = document.createElement('td');
                newWeight.textContent = response.row.weight;
                var newUnits = document.createElement('td');
                if(response.row.lbs === 1){
                    newUnits.textContent = 'lbs';
                } else {
                    newUnits.textContent = 'kgs';
                }
                var newDate = document.createElement('td');
                newDate.textContent = response.row.date;

                // create edit button for row
                var newEdit = document.createElement('td');
                var editButton = document.createElement('form');
                editButton.setAttribute('action','/edit');
                editButton.setAttribute('method', 'post');
                editButton.setAttribute('id','editForm')
                var editStatus = document.createElement('input');
                editStatus.setAttribute('type', 'hidden');
                editStatus.setAttribute('name', 'buttonStatus');
                editStatus.setAttribute('value', 'edit');
                var editID = document.createElement('input');
                editID.setAttribute('type', 'hidden');
                editID.setAttribute('name', 'editID');
                editID.setAttribute('value',response.row.id);
                var editSubmit = document.createElement('button');
                editSubmit.setAttribute('type','submit');
                editSubmit.setAttribute('id', 'edit'+response.row.id);
                editSubmit.textContent = 'Edit';
                editButton.appendChild(editStatus);
                editButton.appendChild(editID);
                editButton.appendChild(editSubmit);
                newEdit.appendChild(editButton);

                // create delete button for row
                var newDelete = document.createElement('td');
                var deleteButton = document.createElement('form');
                deleteButton.setAttribute('action','/');
                deleteButton.setAttribute('method', 'post');
                var deleteStatus = document.createElement('input');
                deleteStatus.setAttribute('type', 'hidden');
                deleteStatus.setAttribute('name', 'buttonStatus');
                deleteStatus.setAttribute('value', 'delete');
                var deleteID = document.createElement('input');
                deleteID.setAttribute('type', 'hidden');
                deleteID.setAttribute('name', 'deleteID');
                deleteID.setAttribute('value',response.row.id);
                var deleteSubmit = document.createElement('button');
                deleteSubmit.setAttribute('type','submit');
                deleteSubmit.setAttribute('id', 'delete'+response.row.id);
                deleteSubmit.className = 'deleteButton';
                deleteSubmit.textContent = 'Delete';
                deleteSubmit.addEventListener('click',deleteRow);
                deleteButton.appendChild(deleteStatus);
                deleteButton.appendChild(deleteID);
                deleteButton.appendChild(deleteSubmit);
                newDelete.appendChild(deleteButton);

                // append new row to table
                newRow.appendChild(newName);
                newRow.appendChild(newReps);
                newRow.appendChild(newWeight);
                newRow.appendChild(newUnits);
                newRow.appendChild(newDate);
                newRow.appendChild(newEdit);
                newRow.appendChild(newDelete);
                document.getElementById('workoutList').appendChild(newRow);

                // clear form
                document.getElementById('name').value = null;
                document.getElementById('reps').value = null;
                document.getElementById('weight').value = null;
                document.getElementById('units').value = 'lbs';
                document.getElementById('date').value = null;
            } else {
                console.log('Error in network request: ' + req.statusText);
            }
        });
        req.send(JSON.stringify(payload));
        event.preventDefault();
    });

    // make sure existing delete buttons have the correct click listener
    var delButtons = document.getElementsByClassName('deleteButton')
    for (var i = 0; i < delButtons.length; i++){
        delButtons[i].addEventListener('click', deleteRow);
    }
}

function deleteRow(event){
    var req = new XMLHttpRequest();
    var payload = {
        deleteID: null,
        buttonStatus:'delete'
    };
    payload.deleteID = event.target.parentNode.parentNode.parentNode.id;

    req.open('POST', '/',true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400) {
            var deletedRow = document.getElementById(payload.deleteID);
            deletedRow.remove();

        } else {
            console.log('Error in network request: ' + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();

}

