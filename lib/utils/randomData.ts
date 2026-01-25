export const FIRST_NAMES = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella', 'Elijah', 'Sophia', 'Lucas',
    'Mia', 'Mason', 'Charlotte', 'Logan', 'Amelia', 'Alexander', 'Harper', 'Ethan', 'Evelyn', 'Jacob',
    'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Henry', 'Mila', 'Jackson', 'Ella', 'Sebastian',
    'Avery', 'Aiden', 'Sofia', 'Matthew', 'Camila', 'Samuel', 'Aria', 'David', 'Scarlett', 'Joseph'
];

export const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

export const STREETS = [
    'Maple Ave', 'Oak St', 'Main St', 'Cedar Ln', 'Park Blvd', 'Elm St', 'Washington St', 'Lakeview Dr',
    'Hillside Ave', 'Sunset Blvd', 'Broadway', 'Market St', 'Pine St', 'Willow Cr', 'Highland Ave'
];

export const CITIES = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco'
];

export const JOB_ROLES = [
    { title: 'Executive Chef', minWage: 50, maxWage: 80 },
    { title: 'Sous Chef', minWage: 30, maxWage: 45 },
    { title: 'Line Cook', minWage: 20, maxWage: 28 },
    { title: 'Prep Cook', minWage: 16, maxWage: 22 },
    { title: 'Event Director', minWage: 35, maxWage: 55 },
    { title: 'Event Coordinator', minWage: 25, maxWage: 35 },
    { title: 'Head Server', minWage: 20, maxWage: 30 },
    { title: 'Server', minWage: 15, maxWage: 25 },
    { title: 'Head Bartender', minWage: 25, maxWage: 35 },
    { title: 'Bartender', minWage: 20, maxWage: 30 },
    { title: 'Dishwasher', minWage: 15, maxWage: 18 },
    { title: 'Delivery Driver', minWage: 17, maxWage: 22 }
];

export function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomName() {
    return `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
}

export function generateRandomPhone() {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${prefix}-${line}`;
}

export function generateRandomAddress() {
    const num = Math.floor(Math.random() * 9999) + 1;
    const street = getRandomElement(STREETS);
    const city = getRandomElement(CITIES);
    const zip = Math.floor(Math.random() * 89999) + 10000;
    return `${num} ${street}, ${city}, NY ${zip}`;
}

export function generateRandomEmail(name: string) {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '.');
    // Add randomness to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${cleanName}.${randomSuffix}@example.com`;
}
