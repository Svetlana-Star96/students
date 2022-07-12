document.addEventListener('DOMContentLoaded', () => {
  const MIN_BIRTHDAY = new Date('1900-01-01'); //нижний диапозон даты рождения
  const MIN_YEAR = 2000; //нижний диапозон года начала обучения
  const CURRENT_DATE = new Date(); 

  //функция фильтрации массива
  function filterArray(filterObject, students) {
    return students
      .filter(student => student.name.concat(student.surname,student.middlename).toLowerCase().includes(filterObject.name.toLowerCase().trim()))
      .filter(student => student.faculty.toLowerCase().includes(filterObject.faculty.toLowerCase().trim()))
      //второе условие, чтобы если год не задан, то фильтр по сути не сработал
      .filter(student => student.yearStart == filterObject.yearStart.trim() || filterObject.yearStart == '')
      .filter(student => student.yearStart + 4 == filterObject.yearEnd.trim() || filterObject.yearEnd == '')
  }

  //функция сортировки массива студентов
  function sotrArray(sortColumn, students) {
    let studSotrArray = students.slice(0); //чтобы не сортировать исходный массив
    studSotrArray.sort((a, b) => {
      let aValue;
      let bValue;
      switch (sortColumn) {
        case 1:
          //ФИО
          aValue = a.surname + a.name + a.middlename;
          bValue = b.surname + b.name + b.middlename;
        break;
        case 2:
          //Факультет
          aValue = a.faculty;
          bValue = b.faculty;
        break;
        case 3:
          //ДР
          aValue = a.birthday;
          bValue = b.birthday;
        break;
        case 4:
          //Год начала обучения
          aValue = a.yearStart;
          bValue = b.yearStart;
        break;
      }
      if (aValue > bValue) {
        return 1;
      }
      if (aValue < bValue) {
        return -1;
      }
      // a должно быть равным b
      return 0;
    });
    return studSotrArray;
  }
  

  //функция приведения даты к формату дд.мм.гггг
  function formatDate(date) { 
    let dateObject = typeof date === 'string' ? new Date(date) : date;
    let dd = dateObject.getDate(); //день
    if (dd < 10) dd = '0' + dd; //добавить 0 в начало, если дата меньше 10
    let mm = dateObject.getMonth() + 1;  // плюс 1, т.к. нумерая с 0
    if (mm < 10) mm = '0' + mm;   
    var yyyy = dateObject.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
  }

  //функция определения возраста
  function getAge(birthday) {
    let birthdayObject = typeof birthday === 'string' ? new Date(birthday) : birthday;
    //количество лет без учета месяца и дня
    let age = CURRENT_DATE.getFullYear() - birthdayObject.getFullYear();

    //если текущий месяц меньше месяца рождения
    //или месяца равны и текущий день меньшне дня рождения
    if ((CURRENT_DATE.getMonth() < birthdayObject.getMonth()) || 
    (CURRENT_DATE.getMonth() === birthdayObject.getMonth() && CURRENT_DATE.getDate() < birthdayObject.getDate())) {
      //убрать 1 год в возрасте
      age--;
    }

    return age;
  }

  //функция определения курса
  function getCourse(start, end) {
    let course = CURRENT_DATE.getFullYear() - start;
    //если обучение ещё не закончилось
    //или если текущий год - год окончания обучения и не прошел сентябрь
    if (course < 4 || end === CURRENT_DATE.getFullYear() && CURRENT_DATE.getMonth() <= 8) return `${course} курс`;
    //если текущий год - год окончания обучиния и прошел сентябрь
    //или год окончания обучения уже прошел
    if (end === CURRENT_DATE.getFullYear() && CURRENT_DATE.getMonth() > 8 || end < CURRENT_DATE.getFullYear()) return 'закончил';
  }

  //функция добавления строки в таблицу
  function addRow(table, student) {
    let newRow = table.insertRow();
    //ФИО
    newRow.insertCell().appendChild(document.createTextNode(`${student.surname} ${student.name} ${student.middlename}`));    
    //Факультет
    newRow.insertCell().appendChild(document.createTextNode(student.faculty));    
    //ДР и возраст
    newRow.insertCell().appendChild(document.createTextNode(`${formatDate(student.birthday)} (${getAge(student.birthday)} лет)`));    
    //Годы обучения
    newRow.insertCell().appendChild(document.createTextNode(`${student.yearStart}-${student.yearStart + 4} (${getCourse(student.yearStart, student.yearStart + 4)})`));    
  }

  //функция перерисовки строк в таблице по массиву студентов
  function updateTable(table, students = []) {
    let tableBody = table.querySelector('tbody');
    //удалить все строки таблицы
    while(tableBody.rows.length > 0) {
      tableBody.deleteRow(0);
    }    
    //Цикл по массиву с объектами
    for (let student of students) {
      //добавить строку (student - объект)
      addRow(tableBody, student);
    }
  }

  //функция валидации полей 
  function validateForm(elements) {
    let requiredError = [];
    let msgError = '';
    //проверка, что все поля заполнены
    for (let key in elements) {
      //если нет значения
      if (elements[key].value.trim() === '') {
        //добавить название поля в массив
        requiredError.push(elements[key].parentNode.querySelector('label').textContent); 
      }
      //проверка, что дата рождения >= 01.01.1900 и < текущей даты
      if (key === 'birthday'&& (elements[key].valueAsDate < MIN_BIRTHDAY || elements[key].valueAsDate > CURRENT_DATE)) {
          msgError +=`Дата рождения должна быть в диапозоне от ${formatDate(MIN_BIRTHDAY)} до текущей даты <br>`;        
      }
      //проверка, что год начала обучения >= 2000 и < текущей даты
      if (key === 'year' && elements[key].value.trim() !== '' && (elements[key].value < MIN_YEAR || elements[key].value > CURRENT_DATE.getFullYear())) {
        msgError +=`Год начала обучения должен быть в диапазоне от ${MIN_YEAR}-го до текущего года <br>`;        
      }
    }

    if (requiredError.length !== 0) {
      msgError = `${requiredError} обязательны для заполнения! <br>`.split(',').join(', ') + msgError;
    }

    return msgError;
  }
  

  //главная функция
  function createAppPanel(arrayStudents) {
    //при загрузке страницы выгрузить массив из localStorage в массив, а затем в таблицу
    let errorWrapper = document.createElement('div');
    let tableStudents = document.querySelector('table');
    let students = arrayStudents; 
    let studentsFilter = [];
    let studentsSotr = [];
    updateTable(tableStudents, students);    

    //обработчик при добавлении студента
    document.querySelector('#add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      let form = e.currentTarget;
      let name = document.querySelector('#name');
      let surname = document.querySelector('#surname');
      let middlename = document.querySelector('#middlename');
      let birthday = document.querySelector('#birthday');
      let year = document.querySelector('#year');
      let faculty = document.querySelector('#faculty');

      let formElements = {
        name: name,
        surname: surname,
        middlename: middlename,
        birthday: birthday,
        year: year,
        faculty: faculty
      }

      //валидация полей 
      let error = validateForm(formElements); //возвращает сообщение
      if (error === '') {
        errorWrapper.remove();
        //добавить новый объект в массив
        let studentNew = {
          name: name.value.trim(),
          surname: surname.value.trim(),
          middlename: middlename.value.trim(),
          birthday: birthday.valueAsDate,
          yearStart: Number(year.value),
          faculty: faculty.value.trim()
        }
        students.push(studentNew);
        //записать массив в localStorage
        localStorage.setItem('students', JSON.stringify(students));
        //обновить таблицу
        updateTable(tableStudents, students);
        //очистить поля формы
        for (let key in formElements) {
          let el = formElements[key];
          el.value = '';
        }
        //очистить поля фильтра
        document.querySelectorAll('.filter-input').forEach(el => {
          el.value = '';
        })
      }
      else {
        errorWrapper.classList.add('alert', 'alert-danger', 'col-9');
        errorWrapper.innerHTML = error;
        form.querySelector('button').before(errorWrapper);
      }
    })

    //обработчик события при вводе текста в поля фильтра (сразу все)
    document.querySelectorAll('.filter-input').forEach( el => {
      el.addEventListener('input', () => {
        //записать в объект все значения фильтра 
        let filterInput = {
          name: document.querySelector('#name-filter').value,
          faculty: document.querySelector('#faculty-filter').value,
          yearStart: document.querySelector('#year-filter').value,
          yearEnd: document.querySelector('#year-end-filter').value
        };
        studentsFilter = studentsSotr.length !== 0 ? filterArray(filterInput, studentsSotr) : filterArray(filterInput, students);
        updateTable(tableStudents, studentsFilter);
      })
    })

    //обработчик события при нажатии на шапку таблицы для сортировки
    document.querySelectorAll('.sotr-cell').forEach(el => {
      el.addEventListener('click', (e) => {
        //определить по какому номеру столбца кликнули
        let column = 1;
        for (let i = 0; i < e.currentTarget.parentElement.children.length; i++) {
          if (e.currentTarget.parentElement.children[i] === e.currentTarget) {
            column = ++i;
            break;
          }
        }        
        //если был наложен фильтр на таблицу
        studentsSotr = studentsFilter.length !== 0 ? sotrArray(column, studentsFilter) : sotrArray(column, students);
        updateTable(tableStudents, studentsSotr);
      })
    })

  }

  let studentsTest = [
    {
      name: 'Иван',
      surname: 'Иванов',
      middlename: 'Иванович',
      birthday: new Date('1995-02-11'),
      yearStart: 2018,
      faculty: 'Технологический факультет'
    },
    {
      name: 'Светлана',
      surname: 'Стародубцева',
      middlename: 'Вячеславовна',
      birthday: new Date('1996-04-19'),
      yearStart: 2013,
      faculty: 'Технологический факультет'
    },
    {
      name: 'Федор',
      surname: 'Петров',
      middlename: 'Сергеевич',
      birthday: new Date('1999-06-04'),
      yearStart: 2019,
      faculty: 'Исторический факультет'
    },
    {
      name: 'Анна',
      surname: 'Иванова',
      middlename: 'Георгиевна',
      birthday: new Date('1999-06-05'),
      yearStart: 2014,
      faculty: 'Исторический факультет'
    }
  ]

  createAppPanel(localStorage.getItem('students') !== null ? JSON.parse(localStorage.getItem('students')) : []);
})