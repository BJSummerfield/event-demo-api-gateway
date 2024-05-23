import { RESTDataSource } from '@apollo/datasource-rest';

class UserManagementService extends RESTDataSource {
    override baseURL = 'http://microservices-demo-user-management-service:8000/';

    async getUserById(id: string) {
        try {
            return await this.get(`users/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch user with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to fetch user with ID ${id}`);
        }
    }

    async getAllUsers() {
        try {
            return await this.get('users');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch users: ${error.message}`);
            }
            throw new Error('Unable to fetch users');
        }
    }

    async createUser(email: string) {
        try {
            return await this.post('users', {
                body: { email },
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to create user: ${error.message}`);
            }
            throw new Error('Unable to create user');
        }
    }

    async deleteUser(id: string) {
        try {
            return await this.delete(`users/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to delete user with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to delete user with ID ${id}`);
        }
    }
}

export default UserManagementService;


