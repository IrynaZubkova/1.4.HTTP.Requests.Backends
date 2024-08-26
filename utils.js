export function getAge(birthdayStr) {
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

export function formatBirthday(birthDate) {
    if (!birthDate) return 'Невідомо';

    const date = new Date(birthDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}


export function getColorLabel(color) {
    const colors = {
        "#ff0000": "Червоний",
        "#00ff00": "Зелений",
        "#0000ff": "Синій",

    };
    return colors[color] || color;
}