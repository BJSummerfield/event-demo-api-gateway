import { RESTDataSource } from '@apollo/datasource-rest';

class BirthdayService extends RESTDataSource {
    override baseURL = 'http://birthday-service:8080/';

    async getAllBirthdays() {
        try {
            return await this.get('birthdays');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch birthdays: ${error.message}`);
            }
            throw new Error('Unable to fetch birthdays');
        }
    }

    async getBirthdayById(id: string) {
        try {
            return await this.get(`birthdays/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to fetch birthday with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to fetch birthday with ID ${id}`);
        }
    }

    async createBirthday(birthday: { id: string; birthday: string }) {
        try {
            return await this.post('birthdays', {
                body: birthday,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to create birthday: ${error.message}`);
            }
            throw new Error('Unable to create birthday');
        }
    }

    async updateBirthday(id: string, birthday: { birthday: string }) {
        try {
            return await this.put(`birthdays/${id}`, {
                body: birthday,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to update birthday with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to update birthday with ID ${id}`);
        }
    }

    async deleteBirthday(id: string) {
        try {
            return await this.delete(`birthdays/${id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Unable to delete birthday with ID ${id}: ${error.message}`);
            }
            throw new Error(`Unable to delete birthday with ID ${id}`);
        }
    }
}

export default BirthdayService;
