
import { db } from '../lib/db';
import { events, users, equipment, menuItems } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { assignStaffToEvent, getEventStaff, addEquipmentToEvent, getEventEquipment, addMenuItemToEvent, getEventMenuItems } from '../lib/actions/event-planning';
import { addEquipment } from '../lib/actions/equipment';

async function run() {
    console.log('--- Starting Verification ---');

    // 1. Get an event (or create one if needed, but assuming ID 1 exists from previous usage)
    const event = await db.select().from(events).limit(1).get();
    if (!event) {
        console.error('No events found. Run create-test-event.ts first.');
        return;
    }
    console.log(`Testing with Event: ${event.name} (ID: ${event.id})`);

    // 2. Test Equipment
    console.log('\n--- Testing Equipment ---');
    // Add a test equipment item
    await addEquipment({ name: 'Test Chair', type: 'rental', defaultRentalCost: 5.0 });
    const equip = await db.select().from(equipment).where(eq(equipment.name, 'Test Chair')).get();

    if (equip) {
        console.log(`Created Equipment: ${equip.name}`);
        // Assign to event
        await addEquipmentToEvent({
            eventId: event.id,
            equipmentId: equip.id,
            quantity: 10
        });
        const assignedEquip = await getEventEquipment(event.id);
        const match = assignedEquip.find(e => e.equipmentId === equip.id);
        if (match && match.quantity === 10) {
            console.log('✅ Equipment Assignment verified');
        } else {
            console.error('❌ Equipment Assignment failed');
        }
    }

    // 3. Test Staff
    console.log('\n--- Testing Staff ---');
    const user = await db.select().from(users).limit(1).get();
    if (user) {
        // Assign
        await assignStaffToEvent({
            eventId: event.id,
            userId: user.id,
            role: 'Test Verify Role'
        });
        const assignedStaff = await getEventStaff(event.id);
        const match = assignedStaff.find(s => s.userId === user.id);
        if (match) {
            console.log(`✅ Staff Assignment verified for ${user.name}`);
        } else {
            console.error('❌ Staff Assignment failed');
        }
    }

    // 4. Test Menu
    console.log('\n--- Testing Menu ---');
    const item = await db.select().from(menuItems).limit(1).get();
    if (item) {
        await addMenuItemToEvent({
            eventId: event.id,
            menuItemId: item.id,
            quantity: 50
        });
        const assignedMenu = await getEventMenuItems(event.id);
        const match = assignedMenu.find(m => m.menuItemId === item.id);
        if (match && match.quantity === 50) {
            console.log(`✅ Menu Assignment verified for ${item.name}`);
        } else {
            console.error('❌ Menu Assignment failed');
        }
    }

    console.log('\n--- Verification Complete ---');
}

run().catch(console.error);
