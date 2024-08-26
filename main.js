import {getAge, formatBirthday, getColorLabel} from './utils.js';

const config1 = {
    parent: '#usersTable',
    columns: [
        {
            title: 'Ім’я',
            value: 'name',
            input: {type: 'text', name: 'name',}
        },
        {
            title: 'Прізвище',
            value: 'surname',
            input: {type: 'text', name: 'surname',}
        },
        {
            title: 'Вік',
            value: (user) => getAge(user.birthday)
        },
        {
            title: 'Фото',
            value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
            input: {type: 'url', name: 'avatar'}
        },
        {
            title: 'День народження',
            value: (user) => formatBirthday(user.birthday),
            input: {type: 'date', name: 'birthday'}
        },
    ],
    apiUrl: "https://mock-api.shpp.me/%3Cizubkova%3E/users"
};
const config2 = {
    parent: '#productsTable',
    columns: [
        {
            title: 'Назва',
            value: 'title',
            input: {type: 'text', name: 'title'}
        },
        {
            title: 'Ціна',
            value: (product) => `${product.price} ${product.currency}`,
            input: [
                {type: 'number', name: 'price', label: 'Ціна'},
                {type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false}
            ]
        },
        {
            title: 'Колір',
            value: (product) => getColorLabel(product.color),
            input: {type: 'color', name: 'color'}
        },

    ],
    apiUrl: "https://mock-api.shpp.me/izubkova/products"
};

async function fetchData(url) {
    try {
        console.log('Fetching data from API:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Raw data from API:', data);
        if (data.data && typeof data.data === 'object') {
            return Object.entries(data.data).map(([key, value]) => ({id: key, ...value}));
        } else if (Array.isArray(data)) {
            return data.map((item, index) => ({id: index + 1, ...item}));
        } else {
            throw new Error('Невідома структура даних.');
        }
    } catch (error) {
        console.error('Помилка при отриманні даних:', error);
        return [];
    }
}

function createTable(parentElement, data, columns, apiUrl, config) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');

    columns.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col.title;
        headerRow.appendChild(th);
    });

    const thDelete = document.createElement('th');
    thDelete.textContent = 'Дії'; // Назва для стовпця з кнопками
    headerRow.appendChild(thDelete);

    thead.appendChild(headerRow);

    const addButton = document.createElement('button');
    addButton.textContent = 'Додати';
    addButton.className = 'add-btn';


    addButton.addEventListener('click', () => {
        openModal(config);
    });


    parentElement.insertBefore(addButton, parentElement.firstChild);

    data.forEach((item) => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const cell = document.createElement('td');
            cell.innerHTML = typeof col.value === 'function' ? col.value(item) : item[col.value];
            row.appendChild(cell);
        });

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => {
            deleteRow(row, item.id, apiUrl);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    parentElement.appendChild(table);
}

function deleteRow(row, id, apiUrl) {
    row.remove();
    if (id) {
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        }).then(response => {
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}

async function initializeDataTable(config) {
    const parentElement = document.querySelector(config.parent);
    if (!parentElement) {
        console.error(`Element ${config.parent} not found`);
        return;
    }

    let data;
    if (config.data) {
        data = config.data;
    } else if (config.apiUrl) {
        try {
            data = await fetchData(config.apiUrl);
        } catch (error) {
            console.error(`Error fetching data for ${config.parent}:`, error);
            return;
        }
    } else {
        console.error('No data provided and no API URL specified.');
        return;
    }

    createTable(parentElement, data, config.columns, config.apiUrl, config);
}


function createModal(config) {
    const {columns, onSubmit, title, type} = config;

    const modalId = 'modal-' + Date.now();
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    if (title) {
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = title;
        modalContent.appendChild(modalTitle);
    }

    const closeButton = document.createElement('span');
    closeButton.className = 'close-btn';
    closeButton.textContent = '×';
    closeButton.onclick = () => closeModal(modalId);
    modalContent.appendChild(closeButton);

    const form = document.createElement('form');

    columns.forEach(col => {
        if (col.input) {
            let fieldWrapper = document.createElement('div');

            let label = document.createElement('label');
            label.textContent = col.title || '';
            label.htmlFor = col.input.name || '';

            let input;
            if (Array.isArray(col.input)) {
                col.input.forEach(field => {
                    let inputElement = createInputElement(field);
                    if (field.required !== false) {
                        inputElement.required = true;
                    }
                    fieldWrapper.appendChild(inputElement);
                });
            } else {
                input = createInputElement(col.input);
                if (col.input.required !== false) {
                    input.required = true;
                }
                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(input);
            }

            form.appendChild(fieldWrapper);
        }
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Зберегти';
    form.appendChild(submitButton);

    form.onsubmit = (e) => {
        handleSubmit(e, config);
    };

    modalContent.appendChild(form);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
    return modal;
}



function createInputElement(inputConfig) {
    let input;
    if (inputConfig.type === 'select') {
        input = document.createElement('select');
        input.name = inputConfig.name || '';
        if (inputConfig.options) {
            inputConfig.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                input.appendChild(optionElement);
            });
        }
    } else if (inputConfig.type === 'textarea') {
        input = document.createElement('textarea');
        input.name = inputConfig.name || '';
        input.placeholder = inputConfig.placeholder || '';
    } else {
        input = document.createElement('input');
        input.type = inputConfig.type;
        input.name = inputConfig.name || '';
        input.placeholder = inputConfig.placeholder || '';
    }
    return input;
}

function openModal(config) {
    const modal = createModal({
        ...config,
    });
    modal.style.display = 'block';
}

async function handleSubmit(event, config) {
    event.preventDefault();

    const data = {};
    let inputs = event.target.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.required && !input.value.trim()) {
            isValid = false;
        }
    });
    if (!isValid) {
        return;
    }
    inputs.forEach(el => {
        const value = el.type === 'number' ? parseInt(el.value) : el.value
        data[el.name] = value
    })

    console.log('Submitting data:', data);

    try {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseBody = await response.text();
        console.log('Response text:', responseBody);

        if (!response.ok) {
            console.error(`Error response from server: ${responseBody}`);
            return;
        } else {
            const result = JSON.parse(responseBody);
            console.log('Success:', result);
            addRowToTable(data, config)
        }
    } catch (error) {
        console.error('Error:', error);
    }
    closeModal(event.target.closest('.modal').id);

}

function addRowToTable(data, config) {
    console.log('Original data:', data);
    console.log('Config:', config);

    // Перетворюємо дані для таблиці
    const transformedData = transformDataForTable(data, config);

    console.log('Transformed data:', transformedData);

    const tableBody = document.querySelector(`${config.parent} table tbody`);
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    const newRow = document.createElement('tr');

    config.columns.forEach(column => {
        const newCell = document.createElement('td');
        const value = transformedData[column.title] || ''; // Відображення даних

        console.log(`Column title: ${column.title}`);
        console.log(`Data value: ${value}`);

        newCell.innerHTML = value;
        newRow.appendChild(newCell);
    });
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Видалити';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        deleteRow(newRow, data.id, config.apiUrl);
    });
    deleteCell.appendChild(deleteButton);
    newRow.appendChild(deleteCell);
    tableBody.appendChild(newRow);
}

function transformDataForTable(data, config) {
    const transformedData = {};

    config.columns.forEach(column => {
        if (typeof column.value === 'function') {
            transformedData[column.title] = column.value(data);
        } else {
            transformedData[column.title] = data[column.value] || '';
        }
    });
    return transformedData;
}


export function closeModal(formId) {
    document.getElementById(formId).style.display = 'none';
}

window.closeModal = closeModal;

initializeDataTable(config1);
initializeDataTable(config2);
