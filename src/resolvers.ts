import graphqlFields from 'graphql-fields';
import { pubsub } from './rabbitMQ.js';

interface User {
    id: string;
    email: string;
    name?: { id: string, username?: string };
    birthday?: { id: string, birthday?: string };
}

function logError(message: string, error: unknown): void {
    console.error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

function throwNotFoundError(item: string, id: string): never {
    logError(`${item} with ID ${id} not found`, new Error('Not Found'));
    throw new Error(`${item} not found`);
}

const resolvers = {
    User: {
        name: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                const name = await dataSources.nameService.getNameById(parent.id);
                return name || null;
            } catch (error) {
                logError(`Error fetching name for user with ID ${parent.id}`, error);
                return null;
            }
        },
        birthday: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                const birthday = await dataSources.birthdayService.getBirthdayById(parent.id);
                return birthday || null;
            } catch (error) {
                logError(`Error fetching birthday for user with ID ${parent.id}`, error);
                return null;
            }
        },
    },
    Query: {
        getUser: async (_: any, { id }: { id: string }, { dataSources }: any) => {
            try {
                const user = await dataSources.userManagementService.getUserById(id);
                if (!user) {
                    throwNotFoundError('User', id);
                }
                return user;
            } catch (error) {
                logError(`Error fetching user with ID ${id}`, error);
                return null;
            }
        },
        getAllUsers: async (_: any, __: any, { dataSources }: any) => {
            try {
                return await dataSources.userManagementService.getAllUsers();
            } catch (error) {
                logError('Error fetching all users', error);
                return [];
            }
        },
        getAllBirthdays: async (_: any, __: any, { dataSources }: any) => {
            try {
                return await dataSources.birthdayService.getAllBirthdays();
            } catch (error) {
                logError('Error fetching all birthdays', error);
                return [];
            }
        },
        getAllNames: async (_: any, __: any, { dataSources }: any) => {
            try {
                return await dataSources.nameService.getAllNames();
            } catch (error) {
                logError('Error fetching all names', error);
                return [];
            }
        }
    },
    Mutation: {
        createUser: async (_: any, { email }: { email: string }, { dataSources }: any) => {
            try {
                const user = await dataSources.userManagementService.createUser(email);
                console.log(`Created user ${user}`);
                return { id: user.id, email: user.email };
            } catch (error) {
                logError('Error creating user', error);
                return null;
            }
        },
        updateUser: async (_: any, { id, name, birthday }: { id: string; name?: string; birthday?: string }, { dataSources }: any, info: any) => {
            try {
                const requestedFields = graphqlFields(info);
                const result: Partial<User> = { id };
                if (name && requestedFields.name) {
                    const updateNameResult = await dataSources.nameService.updateName(id, { name });
                    result.name = updateNameResult ? { id, username: updateNameResult.name } : throwNotFoundError('Name update', id);
                }
                if (birthday && requestedFields.birthday) {
                    const updateBirthdayResult = await dataSources.birthdayService.updateBirthday(id, { birthday });
                    result.birthday = updateBirthdayResult ? { id, birthday: updateBirthdayResult.birthday } : throwNotFoundError('Birthday update', id);
                }
                return result;
            } catch (error) {
                logError(`Error updating user with ID ${id}`, error);
                throw new Error(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        deleteUser: async (_: any, { id }: { id: string }, { dataSources }: any) => {
            try {
                const user = await dataSources.userManagementService.deleteUser(id);
                if (!user) {
                    throwNotFoundError('User', id);
                }
                return user;
            } catch (error) {
                logError(`Error deleting user with ID ${id}`, error);
                throw error;
            }
        },
    },
    Subscription: {
        userCreated: {
            subscribe: () => {
                console.log('Subscribing to USER_CREATED');
                return pubsub.asyncIterator('userCreated');
            },
        },
    },
};

export default resolvers;
