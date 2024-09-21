// script.js
const calendarBody = document.getElementById('calendarBody');
const prevWeekButton = document.getElementById('prevWeek');
const nextWeekButton = document.getElementById('nextWeek');

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

function getWeekStart(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    return start;
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day}.${month}`;
}

function generateWeekDays(startDate) {
    let button_calender = document.getElementsByClassName('day-name')
    for (let i = 0; i < 7; i++) {
        let deletee = document.getElementById(`day_id${i}`);
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        button_calender[i].id = `button/${formatDate(day)}`
        if(deletee === null){
            let datum = document.getElementsByClassName("calendarBody")[i];
            let create_ele = document.createElement('h5');
            create_ele.id = `day_id${i}`
            create_ele.textContent = formatDate(day);
        datum.appendChild(create_ele);}
        else{
            let div = document.getElementById(`day_id${i}`);
            div.textContent = formatDate(day);
        }
    }
}

function showPreviousWeek() {
    currentDate.setDate(currentDate.getDate() - 7);
    const weekStart = getWeekStart(currentDate);
    generateWeekDays(weekStart);
}

function showNextWeek() {
    currentDate.setDate(currentDate.getDate() + 7);
    const weekStart = getWeekStart(currentDate);
    generateWeekDays(weekStart);
}

prevWeekButton.addEventListener('click', showPreviousWeek);
nextWeekButton.addEventListener('click', showNextWeek);

// Initialize the calendar with the current week
const weekStart = getWeekStart(currentDate);
generateWeekDays(weekStart);


var is_div = false

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.day-name');
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const newDiv = document.createElement('div');
            newDiv.classList.add(`dynamicDiv`);
            newDiv.innerHTML = `
                <input type="text" id="search-bar" placeholder="Search for food...">
                <div id="search-results"></div>
                <form method = 'POST'>
                <div id='div_menu'>
                    <div id ='div_breakfest'></div>
                    <div class = div_name>Breakfest calories: </div>
                    <div id = 'drop-breakfest' class = 'div_food' ></div>
                    <div id ='div_lunch'></div>
                    <div class = div_name>Lunch calories:</div>
                    <div id = 'drop-lunch' class = 'div_food' ></div>
                    <div id ='div_dinner'></div>
                    <div class = div_name>Dinner calories:</div>
                    <div id = 'drop-dinner' class =div_food ></div>
                <button id = 'close_button' class="closeDivButton">Close Div</button>
                <button id = 'append_button'class="appendDb" type='submite onclick='submitMeal()'>Append</button>
                </form>
                </div>
            `;
            newDiv.id = 'new_div';
            if(is_div === false){
                const divContainer = document.createElement('div');
                divContainer.id = 'divContainer';
                document.body.appendChild(divContainer);
                divContainer.appendChild(newDiv);
                is_div = true}
            const closeButton = newDiv.querySelector('.closeDivButton');
            closeButton.addEventListener('click', function() {
                document.body.removeChild(divContainer);
                is_div = false
            });
            // tady je search bar.
            document.getElementById('search-bar').addEventListener('input', function() {
                let query = this.value;
                fetch(`/search?q=${query}`)
                    .then(response => response.json())
                    .then(data => {
                        let resultsContainer = document.getElementById('search-results');
                        resultsContainer.innerHTML = '';
                        data.slice(0, 5).forEach(item => { // Limit to first 5 results
                            let div = document.createElement('div');
                            div.className = 'result-item';
                            div.draggable = true;
                            div.textContent = item.name;
                            div.addEventListener('dragstart', function(event) {
                                event.dataTransfer.setData('text/plain', item.name);
                            });
                            resultsContainer.appendChild(div);
                        });
                    });
            });
            
            drag('drop-breakfest')
            drag('drop-lunch')
            drag('drop-dinner')
            
        });
    });
});





function drag(id){
    let dropArea = document.getElementById(id);
            dropArea.addEventListener('dragover', function(event) {
                event.preventDefault();
                dropArea.style.borderColor = 'green';
            });
            
            dropArea.addEventListener('dragleave', function() {
                dropArea.style.borderColor = 'Black';
            });
            
            dropArea.addEventListener('drop', function(event) {
                event.preventDefault();
                dropArea.style.borderColor = 'Black';
                let data = event.dataTransfer.getData('text/plain');
                appendDivWithDeleteButton(data);
                let list_of_calories = calories_count(id);
                let final = calo(list_of_calories);
                final.then(value => {
                    let ide = id.slice(5)
                    console.log(ide)
                    let div = document.getElementById(`div_${ide}`);
                    div.textContent = `${value}`;
                });

            });
            
            
            function appendDivWithDeleteButton(content) {
                const container = document.getElementById(id);
                const newDiv = document.createElement('div');
                newDiv.className = `food_div-${id}`;
                newDiv.textContent = content;
            
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.textContent = 'X';
                newDiv.appendChild(deleteButton);
                container.appendChild(newDiv);
                deleteButton.addEventListener('click', () => {
                    container.removeChild(newDiv);
                    let list_of_calories = calories_count(id);
                let final = calo(list_of_calories);
                final.then(value => {
                    let ide = id.slice(5)
                    console.log(ide)
                    let div = document.getElementById(`div_${ide}`);
                    div.textContent = `${value}`;
                });
                });
            }
            
}

function calories_count(id){
    const name = document.getElementsByClassName(`food_div-${id}`);
    let li = []
    for(x=0; x < name.length; x++){
        const firstFoodDiv = name[x];
        li.push(firstFoodDiv.textContent.slice(0, -1))
    };
    return li
}

async function calo(li){
    let num = 0
    for( let name of li){
        const response = await fetch(`/search?q=${name}`);
        const data = await response.json();
        const foodItem = data[0];
        num += foodItem.calories;
    };
    return num
}

