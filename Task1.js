function fetchData(apiUrl) {
    console.log('Fetching data from API:', apiUrl);
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Raw data from API:', data);
            if (data.data && typeof data.data === 'object') {
                return Object.entries(data.data).map(([key, value]) => ({ id: key, ...value }));
            }
            return data.map((item, index) => ({ id: index + 1, ...item }));
        });
}
function createTable(parentElement, data, columns, apiUrl) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');


    const headerRow = document.createElement('tr');

    columns.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col.title;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);


    data.forEach((item) => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const cell = document.createElement('td');
            cell.innerHTML = typeof col.value === 'function' ? col.value(item) : item[col.value];
            row.appendChild(cell);
        });
        const deleteButton = row.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                // console.log('Delete button clicked. Item:', item);
                if (item.id) {
                    deleteItem(item.id, apiUrl, parentElement, columns);
                } else {
                    // console.error('Item does not have an id:', item);
                }
            });
        }
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    parentElement.innerHTML = '';
    parentElement.appendChild(table);
    // const deleteButtons = parentElement.querySelectorAll('.delete-btn');
    // deleteButtons.forEach(button => {
    //     // console.log('Delete button data-id:', button.getAttribute('data-id'));
    // });
}
function initializeDataTable(config) {
    const parentElement = document.querySelector(config.parent);
    if (!parentElement) {
        console.error(`Element ${config.parent} not found`);
        return;
    }
    console.log(`Initializing data table for ${config.parent} with API URL:`, config.apiUrl); // Додано для перевірки
    fetchData(config.apiUrl)
        .then(data => {
            console.log(`Parsed Data for ${config.parent}:`, data); // Додано для перевірки
            createTable(parentElement, data, config.columns, config.apiUrl);
        })
        .catch(error => {
            console.error(`Error fetching data for ${config.parent}:`, error);
        });
}
function getAge(birthdayStr) {
    if (!birthdayStr) {
        return 'Дані відсутні';
    }

    const today = new Date();
    const birthDate = new Date(birthdayStr);


    if (isNaN(birthDate.getTime())) {
        return 'Некоректний формат дати';
    }


    let age = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();


    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        months = months + 12;
    }


    if (age === 0 && months === 0) {
        return '0 months';
    } else if (age === 0 && months > 0) {
        return `${months} month(s)`;
    } else if (age === 1 && months === 0) {
        return '1 year';
    } else if (age === 1 && months > 0) {
        return `1 year and ${months} month(s)`;
    } else if (age > 1 && months === 0) {
        return `${age} years`;
    } else {
        return `${age} years and ${months} month(s)`;
    }
}
function formatBirthday(birthDate) {
    if (!birthDate) return 'Невідомо';

    const date = new Date(birthDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}
function deleteItem(id, apiUrl, parentElement, columns) {
    // console.log('Deleting item with id:', id);

    fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(() => {
            return fetchData(apiUrl);
        })
        .then(data => {
            createTable(parentElement, data, columns, apiUrl);
        })
        // .catch(error => {
        //     // console.error(`Error deleting data:`, error);
        // });
}
function getColorLabel(color) {
    const colors = {
        "#ff0000": "Червоний",
        "#00ff00": "Зелений",
        "#0000ff": "Синій",

    };
    return colors[color] || color;
}

document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.getElementById('addProductBtn');
    addProductBtn.addEventListener('click', () => {
        openProductModal();
    });

    const addUserBtn = document.getElementById('addUserBtn');
    addUserBtn.addEventListener('click', () => {
        openUserModal();
    });
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();


        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });


        console.log('Дані, що відправляються:', data);
    });


});
const addProductForm = document.getElementById('productForm');

addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(addProductForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
});

function openProductModal() {

    document.getElementById('productModalFormContainer').style.display = 'block';
}

function openUserModal() {

    document.getElementById('userForm').reset();

    document.getElementById('modalFormContainer').style.display = 'block';
}

document.querySelectorAll('#userForm input[required]').forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!input.value.trim()) {
                input.style.border = '1px solid red';
            } else {
                input.style.border = '';
            }
        }
    });
});


const handleSubmitUserForm = async (event) => {
    event.preventDefault();

    const formData = new FormData(document.getElementById('userForm'));
    const data = {};
    let formValid = true;

    formData.forEach((value, key) => {
        data[key] = value;
        const inputElement = document.getElementById(key);
        if (!value.trim() && inputElement && inputElement.hasAttribute('required')) {
            inputElement.style.border = '1px solid red';
            formValid = false;
        } else {
            inputElement.style.border = '';
        }
    });
    if (!formValid) {
        return;
    }
    try {
        // Відправити дані на сервер (приклад URL)
        const response = await fetch('https://mock-api.shpp.me/%3Cizubkova%3E/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Не вдалося додати користувача');
        }

        initializeDataTable(config1);

        document.getElementById('userForm').reset();

        alert('Користувача успішно додано!');
    } catch (error) {
        console.error('Помилка додавання користувача:', error.message);
        alert(`Помилка додавання користувача: ${error.message}`);
    }
};


document.getElementById('submitUser').addEventListener('click', handleSubmitUserForm);


document.getElementById('userForm').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmitUserForm(event);
    }
});


const handleSubmitProductForm = async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const currency = document.getElementById('currency').value;
    const color = document.getElementById('color').value.trim();

    let formValid = true;

    if (!title) {
        document.getElementById('title').style.border = '1px solid red';
        formValid = false;
    } else {
        document.getElementById('title').style.border = '';
    }

    if (!price || isNaN(parseFloat(price))) {
        document.getElementById('price').style.border = '1px solid red';
        formValid = false;
    } else {
        document.getElementById('price').style.border = '';
    }

    if (!color) {
        document.getElementById('color').style.border = '1px solid red';
        formValid = false;
    } else {
        document.getElementById('color').style.border = '';
    }

    if (!formValid) {
        console.error('Будь ласка, заповніть всі обов\'язкові поля (Назва, Ціна, Колір) правильно.');
        return;
    }

    if (currency !== '$' && currency !== '€' && currency !== '₴') {
        console.warn('Можливо, ви ввели неправильну валюту. Будьте уважні.');
    }

    const data = {
        title: title,
        price: parseFloat(price),
        currency: currency,
        color: color
    };

    try {
        const response = await fetch('https://mock-api.shpp.me/izubkova/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Не вдалося додати новий товар');
        }

        document.getElementById('productForm').reset();


        initializeDataTable(config2);


        alert('Новий товар успішно додано!');
    } catch (error) {
        console.error('Помилка додавання нового товару:', error.message);
        alert(`Під час додавання нового товару виникла помилка. Будь ласка, спробуйте ще раз. Подробиці помилки: ${error.message}`);
    }
};


document.getElementById('submitProduct').addEventListener('click', handleSubmitProductForm);


document.getElementById('productForm').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmitProductForm(event);
    }
});


document.querySelectorAll('#title, #price, #color').forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!input.value.trim()) {
                input.style.border = '1px solid red';
            } else {
                input.style.border = '';
            }
        }
    });
});





function closeModal(formId) {
    document.getElementById(formId).style.display = 'none';
}
const config1 = {
    parent: '#usersTable',
    columns: [
        {
            title: 'Ім’я',
            value: 'name',
            input: { type: 'text' }
        },
        {
            title: 'Прізвище',
            value: 'surname',
            input: { type: 'text' }
        },
        {
            title: 'Вік',
            value: (user) => getAge(user.birthday)
        },
        {
            title: 'Фото',
            value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
            input: { type: 'url', name: 'avatar' }
        },
        {
            title: 'День народження',
            value: (user) => formatBirthday(user.birthday),
            input: { type: 'date', name: 'birthday' }
        },
        {
            title: 'Дії',
            value: (user) => `<button class="delete-btn" data-id="${user.id}">Видалити</button>`
        }
    ],
    apiUrl: "https://mock-api.shpp.me/%3Cizubkova%3E/users"
};
const config2 = {
    parent: '#productsTable',
    columns: [
        {
            title: 'Назва',
            value: 'title',
            input: { type: 'text' }
        },
        {
            title: 'Ціна',
            value: (product) => `${product.price} ${product.currency}`,
            input: [
                { type: 'number', name: 'price', label: 'Ціна' },
                { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
            ]
        },
        {
            title: 'Колір',
            value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
            input: { type: 'color', name: 'color' }
        },
        {
            title: 'Дії',
            value: (product) => `<button class="delete-btn" data-id="${product.id}">Видалити</button>`
        }
    ],
    apiUrl: "https://mock-api.shpp.me/izubkova/products"
};

initializeDataTable(config1);
initializeDataTable(config2);
