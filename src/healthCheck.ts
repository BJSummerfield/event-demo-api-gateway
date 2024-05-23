import BirthdayService from './datasources/birthdayService.js';
import NameService from './datasources/nameService.js';
import UserManagementService from './datasources/userManagementService.js';

export async function checkDataSourceConnections() {
    const birthdayService = new BirthdayService();
    const nameService = new NameService();
    const userManagementService = new UserManagementService();

    // Test data sources connection
    try {
        await birthdayService.getAllBirthdays();
        console.log('Connected to BirthdayService');
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Failed to connect to BirthdayService: ${error.message}`);
        } else {
            console.error('Failed to connect to BirthdayService');
        }
    }

    try {
        await nameService.getAllNames();
        console.log('Connected to NameService');
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Failed to connect to NameService: ${error.message}`);
        } else {
            console.error('Failed to connect to NameService');
        }
    }

    try {
        await userManagementService.getAllUsers();
        console.log('Connected to UserManagementService');
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Failed to connect to UserManagementService: ${error.message}`);
        } else {
            console.error('Failed to connect to UserManagementService');
        }
    }

    return {
        birthdayService,
        nameService,
        userManagementService,
    };
}

