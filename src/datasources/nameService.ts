import { RESTDataSource } from '@apollo/datasource-rest';

class NameService extends RESTDataSource {
    override baseURL = 'http://localhost:5000/'; // Adjust to your Python service URL

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

    async createUser(user: { id: string; username: string }) {
        try {
            return await this.post('users', {
                body: user,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to create user: ${error.message}`);
            }
            throw new Error('Unable to create user');
        }
    }

    async updateUser(id: string, user: { username: string }) {
        try {
            return await this.put(`users/${id}`, {
                body: user,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to update user with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to update user with ID ${id}`);
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

export default NameService;
