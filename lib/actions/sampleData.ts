'use server'

import { getDataService } from '@/lib/data/factory';
import { SqliteDataService } from '@/lib/data/sqlite-service';
import { revalidatePath } from 'next/cache';

// =========================
// SAMPLE DATA DEFINITIONS
// =========================

// Staff with realistic wages
import { generateRandomName, generateRandomEmail, generateRandomPhone, generateRandomAddress, getRandomElement, JOB_ROLES } from '@/lib/utils/randomData';

function generateRandomStaff() {
    const role = getRandomElement(JOB_ROLES);
    const name = generateRandomName();
    // Random wage within range
    const wage = Math.floor(Math.random() * (role.maxWage - role.minWage)) + role.minWage;

    return {
        name,
        email: generateRandomEmail(name),
        role: 'staff' as const,
        jobTitle: role.title,
        hourlyRate: wage,
        phoneNumber: generateRandomPhone(),
        address: generateRandomAddress(),
        hireDate: new Date().toISOString().split('T')[0] // today
    };
}

function generateRandomClient() {
    const name = generateRandomName();
    return {
        name,
        email: generateRandomEmail(name),
        role: 'client' as const,
        phoneNumber: generateRandomPhone(),
        address: generateRandomAddress()
    };
}


// Menu collections
const SAMPLE_MENUS = [
    {
        name: 'Premium Meat Menu',
        menuType: 'meat' as const,
        description: 'Our finest selection of kosher meat dishes, perfect for elegant celebrations',
        isActive: true
    },
    {
        name: 'Elegant Dairy Menu',
        menuType: 'dairy' as const,
        description: 'Sophisticated dairy and fish options for upscale events',
        isActive: true
    },
    {
        name: 'Parve Excellence Menu',
        menuType: 'parve' as const,
        description: 'Versatile parve selections suitable for any event',
        isActive: true
    },
    {
        name: 'Gluten-Free Kosher Menu',
        menuType: 'glutenfree' as const,
        description: 'Delicious gluten-free options without compromising on taste',
        isActive: true
    },
    {
        name: 'Vegan Kosher Menu',
        menuType: 'vegan' as const,
        description: 'Plant-based kosher cuisine for modern celebrations',
        isActive: true
    },
];

// Menu items organized by menu type
const MEAT_MENU_ITEMS = [
    // Appetizers
    { name: 'Beef Sliders on Brioche Buns', description: 'Mini burgers with caramelized onions', category: 'Appetizer', kosherType: 'meat', prepTime: 30, servingSize: '24 pieces' },
    { name: 'Pastrami Roll-Ups', description: 'Savory pastrami with mustard aioli', category: 'Appetizer', kosherType: 'meat', prepTime: 15, servingSize: '30 pieces' },
    { name: 'Mini Beef Wellingtons', description: 'Tender beef in puff pastry', category: 'Appetizer', kosherType: 'meat', prepTime: 45, servingSize: '20 pieces' },
    { name: 'Chicken Satay Skewers', description: 'Grilled chicken with peanut-free tahini sauce', category: 'Appetizer', kosherType: 'meat', prepTime: 25, servingSize: '40 skewers' },

    // Mains
    { name: 'Slow-Braised Beef Brisket', description: 'Traditional recipe with rich jus', category: 'Main Course', kosherType: 'meat', prepTime: 240, servingSize: 'Serves 15-20' },
    { name: 'Braised Short Ribs', description: 'Fall-off-the-bone tender with red wine reduction', category: 'Main Course', kosherType: 'meat', prepTime: 180, servingSize: 'Serves 12-15' },
    { name: 'Herb-Roasted Chicken', description: 'Free-range chicken with rosemary and thyme', category: 'Main Course', kosherType: 'meat', prepTime: 90, servingSize: 'Serves 10-12' },
    { name: 'Grilled Lamb Chops', description: 'Mint-crusted rack of lamb', category: 'Main Course', kosherType: 'meat', prepTime: 35, servingSize: 'Serves 8-10' },
    { name: 'Beef Tenderloin Medallions', description: 'Pan-seared with mushroom demi-glace', category: 'Main Course', kosherType: 'meat', prepTime: 25, servingSize: 'Serves 10-12' },
    { name: 'Stuffed Chicken Breast', description: 'With spinach and sun-dried tomatoes', category: 'Main Course', kosherType: 'meat', prepTime: 60, servingSize: 'Serves 12-15' },
    { name: 'Traditional Cholent', description: 'Slow-cooked Sabbath stew', category: 'Main Course', kosherType: 'meat', prepTime: 720, servingSize: 'Serves 20-25' },

    // Sides
    { name: 'Roasted Root Vegetables', description: 'Seasonal vegetables with herbs', category: 'Side Dish', kosherType: 'parve', prepTime: 40, servingSize: 'Serves 15-20' },
    { name: 'Garlic Mashed Potatoes', description: 'Creamy with margarine and garlic', category: 'Side Dish', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 15-20' },
    { name: 'Wild Rice Pilaf', description: 'With dried cranberries and almonds', category: 'Side Dish', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 12-15' },
    { name: 'Grilled Asparagus', description: 'With lemon and olive oil', category: 'Side Dish', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 10-12' },
    { name: 'Sweet Potato Tzimmes', description: 'Traditional sweet and savory dish', category: 'Side Dish', kosherType: 'parve', prepTime: 60, servingSize: 'Serves 15-20' },

    // Salads
    { name: 'Israeli Salad', description: 'Fresh tomatoes, cucumbers, and herbs', category: 'Salad', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 20-25' },
    { name: 'Mixed Green Salad', description: 'With balsamic vinaigrette', category: 'Salad', kosherType: 'parve', prepTime: 10, servingSize: 'Serves 20-25' },
    { name: 'Quinoa Tabbouleh', description: 'Middle Eastern grain salad', category: 'Salad', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20' },

    // Kugels
    { name: 'Sweet Noodle Kugel', description: 'Traditional egg noodle pudding', category: 'Side Dish', kosherType: 'parve', prepTime: 75, servingSize: 'Serves 20-25' },
    { name: 'Potato Kugel', description: 'Crispy on the outside, soft inside', category: 'Side Dish', kosherType: 'parve', prepTime: 90, servingSize: 'Serves 15-20' },
    { name: 'Savory Meat Kugel', description: 'With ground beef and onions', category: 'Side Dish', kosherType: 'meat', prepTime: 80, servingSize: 'Serves 12-15' },

    // Desserts
    { name: 'Fruit Platter', description: 'Seasonal fresh fruit arrangement', category: 'Dessert', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 20-25' },
    { name: 'Chocolate Lava Cake', description: 'Rich parve chocolate dessert', category: 'Dessert', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 12' },
    { name: 'Apple Cinnamon Crisp', description: 'Warm spiced apple dessert', category: 'Dessert', kosherType: 'parve', prepTime: 45, servingSize: 'Serves 15-20' },
    { name: 'Sorbet Trio', description: 'Mango, raspberry, and lemon', category: 'Dessert', kosherType: 'parve', prepTime: 5, servingSize: 'Serves 20' },

    // Beverages
    { name: 'Red Wine Selection', description: 'Curated kosher wines', category: 'Beverage', kosherType: 'parve', prepTime: 0, servingSize: '3 bottles per 20 guests' },
    { name: 'Sparkling Grape Juice', description: 'Non-alcoholic celebration drink', category: 'Beverage', kosherType: 'parve', prepTime: 0, servingSize: '50 servings' },
    { name: 'Coffee & Tea Service', description: 'Premium coffee and tea selection', category: 'Beverage', kosherType: 'parve', prepTime: 10, servingSize: '50 servings' },
];

const DAIRY_MENU_ITEMS = [
    // Appetizers
    { name: 'Smoked Salmon Platter', description: 'With capers, red onion, and cream cheese', category: 'Appetizer', kosherType: 'dairy', prepTime: 20, servingSize: '30 pieces' },
    { name: 'Cheese Blintzes', description: 'Filled with sweet cheese', category: 'Appetizer', kosherType: 'dairy', prepTime: 35, servingSize: '25 pieces' },
    { name: 'Caprese Skewers', description: 'Cherry tomatoes, mozzarella, and basil', category: 'Appetizer', kosherType: 'dairy', prepTime: 15, servingSize: '40 skewers' },
    { name: 'Spinach Artichoke Dip', description: 'Creamy with pita chips', category: 'Appetizer', kosherType: 'dairy', prepTime: 25, servingSize: 'Serves 20' },
    { name: 'Mini Quiches', description: 'Assorted flavors', category: 'Appetizer', kosherType: 'dairy', prepTime: 40, servingSize: '30 pieces' },

    // Mains
    { name: 'Grilled Salmon Fillet', description: 'With lemon dill sauce', category: 'Main Course', kosherType: 'dairy', prepTime: 20, servingSize: 'Serves 12-15' },
    { name: 'Poached Halibut', description: 'In white wine butter sauce', category: 'Main Course', kosherType: 'dairy', prepTime: 25, servingSize: 'Serves 10-12' },
    { name: 'Pan-Seared Tilapia', description: 'With herb butter', category: 'Main Course', kosherType: 'dairy', prepTime: 15, servingSize: 'Serves 12-15' },
    { name: 'Baked Salmon Wellington', description: 'Wrapped in puff pastry', category: 'Main Course', kosherType: 'dairy', prepTime: 45, servingSize: 'Serves 8-10' },
    { name: 'Spinach Lasagna', description: 'Layered with ricotta and mozzarella', category: 'Main Course', kosherType: 'dairy', prepTime: 60, servingSize: 'Serves 15-20' },
    { name: 'Penne Alfredo', description: 'Creamy parmesan sauce', category: 'Main Course', kosherType: 'dairy', prepTime: 20, servingSize: 'Serves 12-15' },
    { name: 'Eggplant Parmesan', description: 'Breaded and baked with cheese', category: 'Main Course', kosherType: 'dairy', prepTime: 50, servingSize: 'Serves 12-15' },
    { name: 'Mac & Cheese Bar', description: 'Gourmet with toppings', category: 'Main Course', kosherType: 'dairy', prepTime: 30, servingSize: 'Serves 20-25' },

    // Sides
    { name: 'Roasted Garlic Bread', description: 'With butter and herbs', category: 'Side Dish', kosherType: 'dairy', prepTime: 15, servingSize: 'Serves 20' },
    { name: 'Caesar Salad', description: 'Romaine with parmesan', category: 'Salad', kosherType: 'dairy', prepTime: 15, servingSize: 'Serves 15-20' },
    { name: 'Greek Salad', description: 'With feta cheese', category: 'Salad', kosherType: 'dairy', prepTime: 15, servingSize: 'Serves 15-20' },
    { name: 'Creamy Coleslaw', description: 'Traditional with mayo dressing', category: 'Salad', kosherType: 'dairy', prepTime: 20, servingSize: 'Serves 20-25' },
    { name: 'Garlic Parmesan Roasted Potatoes', description: 'Crispy and cheesy', category: 'Side Dish', kosherType: 'dairy', prepTime: 40, servingSize: 'Serves 15-20' },
    { name: 'Grilled Vegetables Medley', description: 'Zucchini, peppers, onions with cheese', category: 'Side Dish', kosherType: 'dairy', prepTime: 25, servingSize: 'Serves 12-15' },

    // Kugels
    { name: 'Dairy Noodle Kugel', description: 'With cottage cheese and sour cream', category: 'Side Dish', kosherType: 'dairy', prepTime: 75, servingSize: 'Serves 20-25' },

    // Desserts
    { name: 'New York Cheesecake', description: 'Classic with graham crust', category: 'Dessert', kosherType: 'dairy', prepTime: 90, servingSize: 'Serves 12-15' },
    { name: 'Chocolate Mousse', description: 'Rich and creamy', category: 'Dessert', kosherType: 'dairy', prepTime: 30, servingSize: 'Serves 15' },
    { name: 'Tiramisu', description: 'Italian coffee-flavored dessert', category: 'Dessert', kosherType: 'dairy', prepTime: 45, servingSize: 'Serves 12-15' },
    { name: 'Ice Cream Sundae Bar', description: 'Assorted flavors and toppings', category: 'Dessert', kosherType: 'dairy', prepTime: 15, servingSize: 'Serves 25-30' },
    { name: 'Strawberry Shortcake', description: 'Fresh berries with whipped cream', category: 'Dessert', kosherType: 'dairy', prepTime: 35, servingSize: 'Serves 15-20' },
    { name: 'Chocolate Babka', description: 'Traditional sweet yeast bread', category: 'Dessert', kosherType: 'dairy', prepTime: 120, servingSize: 'Serves 12-15' },

    // Beverages
    { name: 'Premium Coffee Bar', description: 'Espresso, cappuccino, latte options', category: 'Beverage', kosherType: 'dairy', prepTime: 15, servingSize: '50 servings' },
    { name: 'Hot Chocolate Station', description: 'With whipped cream and toppings', category: 'Beverage', kosherType: 'dairy', prepTime: 10, servingSize: '30 servings' },
    { name: 'White Wine Selection', description: 'Curated kosher wines', category: 'Beverage', kosherType: 'parve', prepTime: 0, servingSize: '3 bottles per 20 guests' },
];

const PARVE_MENU_ITEMS = [
    // Appetizers
    { name: 'Classic Gefilte Fish', description: 'Traditional with horseradish', category: 'Appetizer', kosherType: 'parve', prepTime: 90, servingSize: '25 pieces' },
    { name: 'Vegetable Sushi Rolls', description: 'Cucumber, avocado, carrot', category: 'Appetizer', kosherType: 'parve', prepTime: 45, servingSize: '40 pieces' },
    { name: 'Hummus Trio', description: 'Classic, roasted red pepper, garlic', category: 'Appetizer', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 20-25' },
    { name: 'Falafel Balls', description: 'Crispy chickpea fritters with tahini', category: 'Appetizer', kosherType: 'parve', prepTime: 30, servingSize: '50 pieces' },
    { name: 'Stuffed Grape Leaves', description: 'Rice and herb filling', category: 'Appetizer', kosherType: 'parve', prepTime: 60, servingSize: '30 pieces' },
    { name: 'Baba Ganoush', description: 'Smoky eggplant dip', category: 'Appetizer', kosherType: 'parve', prepTime: 40, servingSize: 'Serves 20' },

    // Mains
    { name: 'Herb-Crusted Baked Fish', description: 'White fish with breadcrumb topping', category: 'Main Course', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 12-15' },
    { name: 'Grilled Vegetable Platter', description: 'Seasonal vegetables with balsamic glaze', category: 'Main Course', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 15-20' },
    { name: 'Stuffed Bell Peppers', description: 'With rice and vegetables', category: 'Main Course', kosherType: 'parve', prepTime: 50, servingSize: 'Serves 12-15' },
    { name: 'Eggplant Rollatini', description: 'Rolled with breadcrumb filling', category: 'Main Course', kosherType: 'parve', prepTime: 55, servingSize: 'Serves 10-12' },
    { name: 'Portobello Mushroom Steaks', description: 'Marinated and grilled', category: 'Main Course', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 12-15' },

    // Sides
    { name: 'Roasted Brussels Sprouts', description: 'With balsamic reduction', category: 'Side Dish', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 12-15' },
    { name: 'Quinoa Pilaf', description: 'With vegetables and herbs', category: 'Side Dish', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20' },
    { name: 'Roasted Cauliflower', description: 'With tahini drizzle', category: 'Side Dish', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 12-15' },
    { name: 'Sautéed Green Beans', description: 'With garlic and almonds', category: 'Side Dish', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20' },

    // Salads
    { name: 'Fattoush Salad', description: 'Middle Eastern bread salad', category: 'Salad', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20' },
    { name: 'Asian Noodle Salad', description: 'With sesame ginger dressing', category: 'Salad', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20' },
    { name: 'Chickpea Salad', description: 'Mediterranean style', category: 'Salad', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 15-20' },
    { name: 'Beet and Arugula Salad', description: 'With candied walnuts', category: 'Salad', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 12-15' },

    // Desserts
    { name: 'Fruit Sorbet', description: 'Assorted flavors', category: 'Dessert', kosherType: 'parve', prepTime: 5, servingSize: 'Serves 20' },
    { name: 'Parve Chocolate Cake', description: 'Rich and moist', category: 'Dessert', kosherType: 'parve', prepTime: 60, servingSize: 'Serves 15-20' },
    { name: 'Rugelach', description: 'Traditional rolled pastries', category: 'Dessert', kosherType: 'parve', prepTime: 90, servingSize: '40 pieces' },
    { name: 'Coconut Macaroons', description: 'Chewy and sweet', category: 'Dessert', kosherType: 'parve', prepTime: 35, servingSize: '30 pieces' },
    { name: 'Fresh Berry Compote', description: 'Over pound cake', category: 'Dessert', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20' },

    // Beverages
    { name: 'Sparkling Water Station', description: 'With fresh fruit infusions', category: 'Beverage', kosherType: 'parve', prepTime: 10, servingSize: '50 servings' },
    { name: 'Fresh Juice Bar', description: 'Orange, grapefruit, cranberry', category: 'Beverage', kosherType: 'parve', prepTime: 15, servingSize: '40 servings' },
    { name: 'Iced Tea & Lemonade', description: 'House-made refreshments', category: 'Beverage', kosherType: 'parve', prepTime: 20, servingSize: '50 servings' },
];

const GLUTEN_FREE_MENU_ITEMS = [
    // Appetizers
    { name: 'GF Beef Sliders', description: 'On gluten-free buns', category: 'Appetizer', kosherType: 'meat', prepTime: 30, servingSize: '24 pieces', isGlutenFree: true },
    { name: 'GF Chicken Wings', description: 'Baked with GF coating', category: 'Appetizer', kosherType: 'meat', prepTime: 40, servingSize: '50 pieces', isGlutenFree: true },
    { name: 'GF Salmon Cakes', description: 'With dill aioli', category: 'Appetizer', kosherType: 'dairy', prepTime: 25, servingSize: '25 cakes', isGlutenFree: true },
    { name: 'Vegetable Crudités', description: 'With GF dips', category: 'Appetizer', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 25', isGlutenFree: true },

    // Mains
    { name: 'GF Brisket', description: 'Slow-braised, naturally gluten-free', category: 'Main Course', kosherType: 'meat', prepTime: 240, servingSize: 'Serves 15-20', isGlutenFree: true },
    { name: 'GF Roasted Chicken', description: 'Herb-crusted', category: 'Main Course', kosherType: 'meat', prepTime: 90, servingSize: 'Serves 12-15', isGlutenFree: true },
    { name: 'GF Grilled Salmon', description: 'With lemon herb butter', category: 'Main Course', kosherType: 'dairy', prepTime: 20, servingSize: 'Serves 12-15', isGlutenFree: true },
    { name: 'GF Fish Tacos', description: 'With corn tortillas', category: 'Main Course', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 12-15', isGlutenFree: true },

    // Sides
    { name: 'GF Potato Latkes', description: 'Crispy potato pancakes', category: 'Side Dish', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 15-20', isGlutenFree: true },
    { name: 'GF Quinoa Pilaf', description: 'With roasted vegetables', category: 'Side Dish', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20', isGlutenFree: true },
    { name: 'GF Sweet Potato Fries', description: 'Baked until crispy', category: 'Side Dish', kosherType: 'parve', prepTime: 30, servingSize: 'Serves 12-15', isGlutenFree: true },
    { name: 'GF Kugel', description: 'Made with GF noodles', category: 'Side Dish', kosherType: 'parve', prepTime: 75, servingSize: 'Serves 15-20', isGlutenFree: true },
    { name: 'Steamed Vegetables', description: 'Seasonal mix', category: 'Side Dish', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 15-20', isGlutenFree: true },
    { name: 'Rice Pilaf', description: 'With herbs and vegetables', category: 'Side Dish', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20', isGlutenFree: true },

    // Salads
    { name: 'GF Garden Salad', description: 'Mixed greens with GF dressing', category: 'Salad', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 20-25', isGlutenFree: true },
    { name: 'GF Mediterranean Quinoa Salad', description: 'With vegetables and herbs', category: 'Salad', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20', isGlutenFree: true },

    // Desserts
    { name: 'GF Flourless Chocolate Cake', description: 'Rich and decadent', category: 'Dessert', kosherType: 'parve', prepTime: 50, servingSize: 'Serves 12-15', isGlutenFree: true },
    { name: 'GF Coconut Macaroons', description: 'Naturally gluten-free', category: 'Dessert', kosherType: 'parve', prepTime: 30, servingSize: '30 pieces', isGlutenFree: true },
    { name: 'Fresh Fruit Platter', description: 'Seasonal selection', category: 'Dessert', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 20-25', isGlutenFree: true },
    { name: 'GF Brownies', description: 'Fudgy chocolate brownies', category: 'Dessert', kosherType: 'parve', prepTime: 40, servingSize: '24 pieces', isGlutenFree: true },

    // Beverages
    { name: 'Fresh Juice Selection', description: 'All natural, no additives', category: 'Beverage', kosherType: 'parve', prepTime: 10, servingSize: '40 servings', isGlutenFree: true },
    { name: 'Coffee & Tea', description: 'Premium selection', category: 'Beverage', kosherType: 'parve', prepTime: 10, servingSize: '50 servings', isGlutenFree: true },
];

const VEGAN_MENU_ITEMS = [
    // Appetizers
    { name: 'Vegan Stuffed Mushrooms', description: 'With herb breadcrumb filling', category: 'Appetizer', kosherType: 'parve', prepTime: 35, servingSize: '30 pieces', isVegan: true },
    { name: 'Vegan Spring Rolls', description: 'Fresh vegetables with peanut-free dipping sauce', category: 'Appetizer', kosherType: 'parve', prepTime: 30, servingSize: '40 pieces', isVegan: true },
    { name: 'Hummus & Vegetable Platter', description: '100% plant-based', category: 'Appetizer', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 20-25', isVegan: true },
    { name: 'Vegan Spinach Balls', description: 'Baked with nutritional yeast', category: 'Appetizer', kosherType: 'parve', prepTime: 30, servingSize: '35 pieces', isVegan: true },

    // Mains
    { name: 'Vegan Bolognese', description: 'Lentil-based sauce over pasta', category: 'Main Course', kosherType: 'parve', prepTime: 45, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Stuffed Acorn Squash', description: 'With quinoa and cranberries', category: 'Main Course', kosherType: 'parve', prepTime: 60, servingSize: 'Serves 10-12', isVegan: true },
    { name: 'Vegan Shepherd\'s Pie', description: 'Lentils and vegetables with potato topping', category: 'Main Course', kosherType: 'parve', prepTime: 70, servingSize: 'Serves 12-15', isVegan: true },
    { name: 'Chickpea Tikka Masala', description: 'Creamy coconut curry', category: 'Main Course', kosherType: 'parve', prepTime: 40, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Buddha Bowl Bar', description: 'Build-your-own grain bowls', category: 'Main Course', kosherType: 'parve', prepTime: 45, servingSize: 'Serves 20-25', isVegan: true },
    { name: 'Vegan Lasagna', description: 'Layered with cashew ricotta', category: 'Main Course', kosherType: 'parve', prepTime: 75, servingSize: 'Serves 15-20', isVegan: true },

    // Sides
    { name: 'Roasted Vegetable Medley', description: 'Seasonal vegetables with olive oil', category: 'Side Dish', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Vegan Mashed Potatoes', description: 'Creamy with plant milk', category: 'Side Dish', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Quinoa Tabbouleh', description: 'Fresh herb salad', category: 'Salad', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Garlic Roasted Broccoli', description: 'With lemon', category: 'Side Dish', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 12-15', isVegan: true },
    { name: 'Wild Rice Blend', description: 'With dried fruits and nuts', category: 'Side Dish', kosherType: 'parve', prepTime: 35, servingSize: 'Serves 15-20', isVegan: true },

    // Salads
    { name: 'Kale Caesar Salad', description: 'With vegan dressing', category: 'Salad', kosherType: 'parve', prepTime: 20, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Asian Cabbage Slaw', description: 'With sesame dressing', category: 'Salad', kosherType: 'parve', prepTime: 15, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Lentil Walnut Salad', description: 'Protein-packed', category: 'Salad', kosherType: 'parve', prepTime: 25, servingSize: 'Serves 12-15', isVegan: true },

    // Desserts
    { name: 'Vegan Chocolate Cake', description: 'Rich and moist', category: 'Dessert', kosherType: 'parve', prepTime: 60, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Coconut Milk Ice Cream', description: 'Assorted flavors', category: 'Dessert', kosherType: 'parve', prepTime: 5, servingSize: 'Serves 20', isVegan: true },
    { name: 'Vegan Fruit Crisp', description: 'Seasonal fruit with oat topping', category: 'Dessert', kosherType: 'parve', prepTime: 45, servingSize: 'Serves 15-20', isVegan: true },
    { name: 'Energy Balls', description: 'Dates, nuts, and cacao', category: 'Dessert', kosherType: 'parve', prepTime: 15, servingSize: '40 pieces', isVegan: true },
    { name: 'Vegan Cheesecake', description: 'Cashew-based', category: 'Dessert', kosherType: 'parve', prepTime: 90, servingSize: 'Serves 12-15', isVegan: true },

    // Beverages
    { name: 'Smoothie Bar', description: 'Fresh fruit smoothies', category: 'Beverage', kosherType: 'parve', prepTime: 15, servingSize: '30 servings', isVegan: true },
    { name: 'Plant Milk Latte Bar', description: 'Oat, almond, coconut options', category: 'Beverage', kosherType: 'parve', prepTime: 15, servingSize: '40 servings', isVegan: true },
    { name: 'Herbal Tea Selection', description: 'Caffeine-free options', category: 'Beverage', kosherType: 'parve', prepTime: 5, servingSize: '50 servings', isVegan: true },
];

const SAMPLE_EVENTS = [
    {
        name: 'Goldman-Sachs Corporate Gala',
        eventType: 'corporate',
        status: 'active',
        isOutdoors: false,
        location: 'Grand Ballroom, Midtown Hotel',
        guestCount: 250,
        dietaryRequirements: 'Kosher, 5% Vegan, 5% Gluten-Free',
        estimatedBudget: 45000,
        notes: 'VIP service required. Black tie event.'
    },
    {
        name: 'Cohen Bar Mitzvah',
        eventType: 'bar_mitzvah',
        status: 'approved',
        isOutdoors: true,
        location: 'Temple Sinai Garden',
        guestCount: 120,
        dietaryRequirements: 'Strictly Kosher (Meat)',
        estimatedBudget: 18000,
        notes: 'Tent required if raining. Color scheme: Navy and Silver.'
    },
    {
        name: 'Levine Wedding',
        eventType: 'wedding',
        status: 'quote',
        isOutdoors: false,
        location: 'Crystal Plaza',
        guestCount: 300,
        dietaryRequirements: 'Kosher, Nut-Free',
        estimatedBudget: 60000,
        notes: 'Couple wants tasting next week.'
    },
    {
        name: 'Shabbat Dinner Fundraiser',
        eventType: 'fundraiser',
        status: 'inquiry',
        isOutdoors: false,
        location: 'Community Center Hall',
        guestCount: 80,
        dietaryRequirements: 'Parve / Dairy',
        estimatedBudget: 5000,
        notes: 'Low budget, community event.'
    },
    {
        name: 'Stein Baby Naming',
        eventType: 'baby_naming',
        status: 'completed',
        isOutdoors: true,
        location: 'Stein Residence Backyard',
        guestCount: 50,
        dietaryRequirements: 'Dairy brunch',
        estimatedBudget: 3500,
        notes: 'Completed last Sunday. Client was very happy.'
    }
];

const COMMON_INGREDIENTS = [
    { name: 'Kosher Salt', unit: 'kg', pricePerUnit: 2.50 },
    { name: 'Black Pepper', unit: 'kg', pricePerUnit: 15.00 },
    { name: 'Extra Virgin Olive Oil', unit: 'L', pricePerUnit: 12.00 },
    { name: 'Garlic', unit: 'kg', pricePerUnit: 8.00 },
    { name: 'Yellow Onions', unit: 'kg', pricePerUnit: 1.50 },
    { name: 'Fresh Rosemary', unit: 'bunch', pricePerUnit: 2.00 },
    { name: 'Fresh Thyme', unit: 'bunch', pricePerUnit: 2.00 },
    { name: 'Lemons', unit: 'kg', pricePerUnit: 4.00 },
    { name: 'Unsalted Butter (Dairy)', unit: 'kg', pricePerUnit: 10.00 },
    { name: 'Heavy Cream (Dairy)', unit: 'L', pricePerUnit: 6.00 },
    { name: 'Margarine (Parve)', unit: 'kg', pricePerUnit: 5.00 },
    { name: 'All-Purpose Flour', unit: 'kg', pricePerUnit: 1.20 },
    { name: 'Sugar', unit: 'kg', pricePerUnit: 1.00 },
    { name: 'Brown Sugar', unit: 'kg', pricePerUnit: 1.80 },
    { name: 'Cinnamon', unit: 'kg', pricePerUnit: 20.00 },
    { name: 'Vanilla Extract', unit: 'L', pricePerUnit: 45.00 },
    { name: 'Ground Beef (Kosher)', unit: 'kg', pricePerUnit: 18.00 },
    { name: 'Chicken Breast (Kosher)', unit: 'kg', pricePerUnit: 12.00 },
    { name: 'Beef Brisket (Kosher)', unit: 'kg', pricePerUnit: 22.00 },
    { name: 'Fresh Salmon Fillet', unit: 'kg', pricePerUnit: 25.00 },
    { name: 'Potatoes (Yukon Gold)', unit: 'kg', pricePerUnit: 2.00 },
    { name: 'Carrots', unit: 'kg', pricePerUnit: 1.50 },
    { name: 'Celery', unit: 'bunch', pricePerUnit: 2.50 },
    { name: 'Red Wine (Kosher)', unit: 'L', pricePerUnit: 15.00 },
    { name: 'White Wine (Kosher)', unit: 'L', pricePerUnit: 15.00 },
];

// ==============================
// SAMPLE DATA GENERATION ACTIONS
// ==============================

export async function generateSampleData() {
    try {
        const service = getDataService();
        const results = {
            staff: 0,
            clients: 0,
            menus: 0,
            menuItems: 0,
            ingredients: 0,
            events: 0,
            tasks: 0,
            recipes: 0,
            availability: 0,
            blackoutDates: 0,
            shifts: 0,
            bids: 0,
            errors: [] as string[]
        };

        // Track created IDs for strict association
        const newStaffIds: number[] = [];
        const newEventIds: number[] = [];

        // 1. Add Staff (Randomized Additive)
        // Generate 5 random staff members each time
        for (let i = 0; i < 5; i++) {
            const person = generateRandomStaff();
            try {
                const newStaff = await service.addUser({
                    ...person,
                    status: 'active',
                    isSample: true
                });
                results.staff++;
                newStaffIds.push(newStaff.id);
            } catch (e) {
                console.error('Failed to add staff:', person.name, e);
                results.errors.push(`Failed to add staff: ${person.name}`);
            }
        }

        // 2. Add Clients (Randomized Additive)
        // Generate 5 random clients each time
        for (let i = 0; i < 5; i++) {
            const client = generateRandomClient();
            try {
                await service.addUser({
                    ...client,
                    status: 'active',
                    isSample: true
                });
                results.clients++;
            } catch (e) {
                console.error('Failed to add client:', client.name, e);
                results.errors.push(`Failed to add client: ${client.name}`);
            }
        }

        // 3. Add Menus
        const menuIds: Record<string, number> = {};
        for (const menu of SAMPLE_MENUS) {
            try {
                const created = await service.addMenu({ ...menu, isSample: true });
                menuIds[menu.menuType] = created.id;
                results.menus++;
            } catch (e) {
                console.error('Failed to add menu:', menu.name, e);
                results.errors.push(`Failed to add menu: ${menu.name}`);
            }
        }

        // 4. Add Ingredients
        const ingredientIds: number[] = [];
        for (const ing of COMMON_INGREDIENTS) {
            try {
                const created = await service.addIngredient({
                    ...ing,
                    supplierUrl: null,
                    isSample: true
                });
                ingredientIds.push(created.id);
                results.ingredients++;
            } catch (e) {
                console.error('Failed to add ingredient:', ing.name, e);
            }
        }

        // 5. Add Menu Items & Recipes
        const menuItemsToAdd = [
            ...MEAT_MENU_ITEMS.map(item => ({ ...item, menuId: menuIds['meat'] })),
            ...DAIRY_MENU_ITEMS.map(item => ({ ...item, menuId: menuIds['dairy'] })),
            ...PARVE_MENU_ITEMS.map(item => ({ ...item, menuId: menuIds['parve'] })),
            ...GLUTEN_FREE_MENU_ITEMS.map(item => ({ ...item, menuId: menuIds['glutenfree'] })),
            ...VEGAN_MENU_ITEMS.map(item => ({ ...item, menuId: menuIds['vegan'] })),
        ];

        for (const item of menuItemsToAdd) {
            try {
                const createdItem = await service.addMenuItem({
                    menuId: item.menuId,
                    name: item.name,
                    description: item.description,
                    basePrice: 0,
                    category: item.category,
                    isKosher: true,
                    kosherType: (item as any).kosherType,
                    isGlutenFree: (item as any).isGlutenFree || false,
                    isVegan: (item as any).isVegan || false,
                    prepTime: (item as any).prepTime,
                    servingSize: (item as any).servingSize,
                    isSample: true
                });
                results.menuItems++;

                // Add 3-5 random ingredients as a recipe
                if (ingredientIds.length > 0) {
                    const numIngredients = Math.floor(Math.random() * 3) + 3;
                    const selectedIngs = new Set<number>();
                    while (selectedIngs.size < Math.min(numIngredients, ingredientIds.length)) {
                        selectedIngs.add(getRandomElement(ingredientIds));
                    }

                    for (const ingId of selectedIngs) {
                        const amount = (Math.random() * 1.5 + 0.1).toFixed(2);
                        await service.addRecipeItem(createdItem.id, ingId, parseFloat(amount));
                        results.recipes++;
                    }
                }
            } catch (e) {
                console.error('Failed to add menu item:', item.name, e);
                results.errors.push(`Failed to add menu item: ${item.name}`);
            }
        }

        // 6. Add Events
        // Get all clients to assign random clients to events
        // (In a real implementation we would fetch them, but for now we rely on the ones we just added if we knew their IDs, 
        //  but since we don't return IDs from addClient easily here without refetching, we will mock or skip client assignment 
        //  OR we can try to fetch users by role 'client' first).

        // For simplicity, we will just create events without linking to specific new clients 
        // unless we want to fetch them. Let's fetch them to be safe.
        const allUsers = await service.getUsers();
        const clientUsers = allUsers.filter(u => u.role === 'client');

        for (const [index, event] of SAMPLE_EVENTS.entries()) {
            try {
                // Assign a random client if available
                const assignedClient = clientUsers.length > 0
                    ? clientUsers[index % clientUsers.length]
                    : null;

                // Set dates relative to now
                const today = new Date();
                let startDate = new Date();
                let endDate = new Date();

                if (event.status === 'completed') {
                    startDate.setDate(today.getDate() - 7); // Last week
                    endDate.setDate(today.getDate() - 7);
                } else if (event.status === 'active') {
                    startDate.setDate(today.getDate() + 2); // In 2 days
                    endDate.setDate(today.getDate() + 2);
                } else {
                    startDate.setDate(today.getDate() + 14 + (index * 7)); // Future
                    endDate.setDate(today.getDate() + 14 + (index * 7));
                }

                // Set hours
                startDate.setHours(18, 0, 0, 0); // 6 PM
                endDate.setHours(23, 0, 0, 0);   // 11 PM

                const newEvent = await service.addEvent({
                    name: event.name,
                    eventType: event.eventType,
                    status: event.status as any,
                    isOutdoors: event.isOutdoors,
                    location: event.location,
                    guestCount: event.guestCount,
                    dietaryRequirements: event.dietaryRequirements,
                    estimatedBudget: event.estimatedBudget,
                    notes: event.notes,
                    clientId: assignedClient ? assignedClient.id : null,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    isSample: true
                });
                results.events++;
                newEventIds.push(newEvent.id);
            } catch (e) {
                console.error('Failed to add event:', event.name, e);
                results.errors.push(`Failed to add event: ${event.name}`);
            }
        }

        // 6. Add Staff Availability (Next 14 Days)
        const availTypes = ['unavailable', 'preferred_off', 'available'];
        const today = new Date();

        for (const staffId of newStaffIds) {
            // Add entries for next 3-5 random days
            const daysToSet = Math.floor(Math.random() * 3) + 3; // 3 to 5 days

            for (let d = 0; d < daysToSet; d++) {
                try {
                    const date = new Date(today);
                    date.setDate(today.getDate() + Math.floor(Math.random() * 14)); // Random day in next 2 weeks
                    const dateStr = date.toISOString().split('T')[0];

                    const type = getRandomElement(availTypes);
                    let startTime = null;
                    let endTime = null;

                    if (type === 'available') {
                        startTime = '09:00';
                        endTime = '17:00';
                    }

                    if (service.addStaffAvailability) {
                        await service.addStaffAvailability({
                            userId: staffId,
                            date: dateStr,
                            type: type as any,
                            startTime: startTime,
                            endTime: endTime,
                            status: 'approved',
                            reason: 'Sample data',
                            isRecurring: false
                        });
                        results.availability++;
                    }
                } catch (e) {
                    console.error('Failed to add availability', e);
                    // Don't fail the whole batch
                }
            }
        }

        // 7. Add Blackout Dates
        try {
            if (service.addBlackoutDate) {
                // One global holiday
                const blackOutDate = new Date(today);
                blackOutDate.setDate(today.getDate() + 20); // 20 days out

                await service.addBlackoutDate({
                    date: blackOutDate.toISOString().split('T')[0],
                    description: 'Company Holiday (Sample)',
                    isGlobal: true,
                    createdBy: newStaffIds[0] || null
                });
                results.blackoutDates++;
            }
        } catch (e) {
            console.error('Failed to add blackout date', e);
        }

        // 8. Add Open Shifts & Bids
        // Create shifts for active events (future events)
        try {
            if (service.addOpenShift && service.addShiftBid) {
                for (const eventId of newEventIds) {
                    // 50% chance to add shifts
                    if (Math.random() > 0.5) {
                        // Create 2 open shifts
                        const shiftRoles = ['Server', 'Bartender', 'Dishwasher'];

                        for (let s = 0; s < 2; s++) {
                            const role = getRandomElement(shiftRoles);
                            const shift = await service.addOpenShift({
                                eventId: eventId,
                                role: role,
                                startTime: new Date(today.getTime() + 86400000).toISOString(), // Tomorrow
                                endTime: new Date(today.getTime() + 108000000).toISOString(),
                                description: `Help needed for ${role} role`,
                                status: 'open'
                            });
                            results.shifts++;

                            // Add a simplified bid from a random staff member
                            if (newStaffIds.length > 0) {
                                const bidderId = getRandomElement(newStaffIds);
                                await service.addShiftBid({
                                    shiftId: shift.id,
                                    userId: bidderId,
                                    status: 'pending',
                                    notes: 'I am available!'
                                });
                                results.bids++;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to add shifts/bids', e);
        }

        // 6. Add KDS Test Data (Specific for "Today" visualization)
        // User requested: "creates a brnd new set of data different from the sample set of data already there"
        try {
            const uniqueId = Math.random().toString(36).substring(7);

            // a) Create a Staff Member for KDS
            const kdsStaff = await service.addUser({
                name: `KDS Chef ${uniqueId}`,
                email: `chef.${uniqueId}@kds-test.com`,
                role: 'staff',
                jobTitle: 'Head Chef',
                phoneNumber: '555-0199',
                status: 'active',
                isSample: true
            });
            results.staff++;

            // b) Create "Today's" Event
            const todayStart = new Date();
            todayStart.setHours(14, 0, 0, 0); // 2 PM today
            const todayEnd = new Date();
            todayEnd.setHours(22, 0, 0, 0); // 10 PM today

            const kdsEvent = await service.addEvent({
                name: `KDS Test Event ${uniqueId}`,
                eventType: 'corporate',
                status: 'active', // Must be active/approved
                isOutdoors: false,
                location: 'Test Kitchen',
                guestCount: 50,
                dietaryRequirements: 'None',
                estimatedBudget: 5000,
                clientId: null,
                startDate: todayStart.toISOString(),
                endDate: todayEnd.toISOString(),
                isSample: true
            });
            results.events++;

            // c) Create Menu Items & Recipes for this event
            // Create a specific menu for this test
            const kdsMenu = await service.addMenu({
                name: `KDS Menu ${uniqueId}`,
                menuType: 'meat',
                description: 'Test menu for KDS',
                isActive: true,
                isSample: true
            });
            results.menus++;

            // Create items
            const burger = await service.addMenuItem({
                menuId: kdsMenu.id,
                name: `Test Burger ${uniqueId}`,
                category: 'Main',
                description: 'Juicy test burger',
                basePrice: 15,
                isSample: true
            });
            results.menuItems++;

            // Add ingredients (simplified)
            // We need ingredient IDs. Let's make one or two.
            const beef = await service.addIngredient({
                name: `Ground Beef ${uniqueId}`,
                unit: 'kg',
                pricePerUnit: 10,
                isSample: true
            });
            results.ingredients++;

            // Add Recipe
            await service.addRecipeItem(
                burger.id,
                beef.id,
                0.2
            );
            results.recipes++;

            // Link items to event
            await service.addEventMenuItem({
                eventId: kdsEvent.id,
                menuItemId: burger.id,
                quantity: 50
            });

            // d) Assign Staff to Event
            if (service.addEventStaff) {
                await service.addEventStaff({
                    eventId: kdsEvent.id,
                    userId: kdsStaff.id,
                    role: 'Chef'
                });
                results.errors.push(`Created KDS Test Data: Event '${kdsEvent.name}' assigned to '${kdsStaff.name}' (${kdsStaff.email})`);
            } else {
                results.errors.push(`Created KDS Test Data, but failed to assign staff (method missing)`);
            }

        } catch (e) {
            console.error('Failed to add KDS test data', e);
            results.errors.push('Failed to add KDS test data');
        }


        revalidatePath('/dashboard');
        revalidatePath('/dashboard/menus');
        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard/ingredients');
        revalidatePath('/dashboard/calendar');
        revalidatePath('/dashboard/shifts');

        const successMsg = `Successfully generated: ${results.staff} staff, ${results.clients} clients, ${results.menus} menus, ${results.menuItems} items, ${results.events} events, ${results.availability || 0} availability records, ${results.shifts || 0} shifts`;
        const errorMsg = results.errors.length > 0
            ? `\n\nEncountered ${results.errors.length} errors. First error: ${results.errors[0]}`
            : '';

        return {
            success: results.errors.length === 0,
            results,
            message: successMsg + errorMsg
        };

    } catch (error) {
        console.error('Error generating sample data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function clearSampleData() {
    try {
        const service = getDataService();


        if (service.clearSampleData) {
            await service.clearSampleData();
        } else if (service.clearAllData) {
            // Fallback for API mode if supported, or just error
            await service.clearAllData();
        } else {
            return {
                success: false,
                error: 'Clear data function not available for this data service'
            };
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/menus');
        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard/ingredients');

        return {
            success: true,
            message: 'Sample data has been removed (user data preserved)'
        };

    } catch (error) {
        console.error('Error clearing sample data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function getDataStatistics() {
    try {
        const service = getDataService();

        if (service.getDataStats) {
            const stats = await service.getDataStats();
            return {
                success: true,
                stats
            };
        } else {
            return {
                success: false,
                error: 'Stats function not available for this data service'
            };
        }

    } catch (error) {
        console.error('Error getting data statistics:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
