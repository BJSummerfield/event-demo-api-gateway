import { RESTDataSource } from '@apollo/datasource-rest';

class NameService extends RESTDataSource {
    override baseURL = 'http://microservices-demo-name-service:8000/';

    async getAllNames() {
        try {
            return await this.get('names');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch names: ${error.message}`);
            }
            throw new Error('Unable to fetch names');
        }
    }

    async getNameById(id: string) {
        try {
            return await this.get(`name/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch name with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to fetch name with ID ${id}`);
        }
    }

    async createName(name: { id: string; name: string }) {
        try {
            return await this.post('names', {
                body: name,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to create name: ${error.message}`);
            }
            throw new Error('Unable to create name');
        }
    }

    async updateName(id: string, name: { name: string }) {
        try {
            return await this.put(`names/${id}`, {
                body: name,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to update name with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to update name with ID ${id}`);
        }
    }

    async deleteName(id: string) {
        try {
            return await this.delete(`names/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to delete name with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to delete name with ID ${id}`);
        }
    }
}

export default NameService;
