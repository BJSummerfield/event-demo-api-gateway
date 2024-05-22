import graphqlFields from 'graphql-fields';
import { PubSub } from 'graphql-subscriptions';
import { v4 as uuidv4 } from 'uuid';

const pubsub = new PubSub();
const USER_EVENT = 'USER_EVENT';

const resolvers = {
    User: {
        name: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                const user = await dataSources.nameService.getUserById(parent.id);
                return user ? user : null;
            } catch (error: unknown) {
                console.error(`Error fetching user with ID ${parent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
        birthday: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                const birthday = await dataSources.birthdayService.getBirthdayById(parent.id);
                return birthday ? birthday : null;
            } catch (error: unknown) {
                console.error(`Error fetching birthday with ID ${parent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
    },
    Query: {
        getUser: async (_: any, { id }: { id: string }, ___: any) => {
            return { id };
        },
        getAllUsers: async (_: any, __: any, { dataSources }: any) => {
            try {
                const users = await dataSources.nameService.getAllUsers();
                return users.map((user: { id: string }) => ({ id: user.id }));
            } catch (error: unknown) {
                console.error(`Error fetching all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return [];
            }
        },
    },
    Mutation: {
        createUser: async (_: any, { username, birthday }: { username: string, birthday: string }, { dataSources }: any) => {
            const id = uuidv4();
            try {
                const name = await dataSources.nameService.createUser({ id, username });
                const bday = await dataSources.birthdayService.createBirthday({ id, birthday });
                console.log("Create Name: ", name);
                console.log("Create Birthday :", bday);
                const user = {
                    id,
                    name: { id, username: name.username },
                    birthday: { id, birthday: bday.birthday },
                };
                pubsub.publish(USER_EVENT, { userEvent: { type: 'USER_CREATED', user } });
                return user;
            } catch (error) {
                console.error(`Error creating user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
        updateUser: async (_: any, { id, username, birthday }: { id: string, username?: string, birthday?: string }, { dataSources }: { dataSources: any }, info: any) => {
            try {
                const requestedFields = graphqlFields(info);
                const result: { id: string, name?: any, birthday?: any } = { id };

                if (username && requestedFields.name) {
                    const updateUserResult = await dataSources.nameService.updateUser(id, { username });
                    if (!updateUserResult) {
                        throw new Error('Failed to update username');
                    }
                    result.name = { id, username: updateUserResult.username };
                }

                if (birthday && requestedFields.birthday) {
                    const updateBirthdayResult = await dataSources.birthdayService.updateBirthday(id, { birthday });
                    if (!updateBirthdayResult) {
                        throw new Error('Failed to update birthday');
                    }
                    result.birthday = { id, birthday: updateBirthdayResult.birthday };
                }

                if (!username && requestedFields.name) {
                    const user = await dataSources.nameService.getUserById(id);
                    if (user) {
                        result.name = { id, username: user.username };
                    }
                }

                if (!birthday && requestedFields.birthday) {
                    const userBirthday = await dataSources.birthdayService.getBirthdayById(id);
                    if (userBirthday) {
                        result.birthday = { id, birthday: userBirthday.birthday };
                    }
                }

                pubsub.publish(USER_EVENT, { userEvent: { type: 'USER_UPDATED', user: result } });
                return result;
            } catch (error) {
                console.error(`Error updating user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw new Error(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },

        deleteUser: async (_: any, { id }: { id: string }, { dataSources }: any) => {
            try {
                await dataSources.nameService.deleteUser(id);
                await dataSources.birthdayService.deleteBirthday(id);
                const user = { id };
                pubsub.publish(USER_EVENT, { userEvent: { type: 'USER_DELETED', user } });
                return user;
            } catch (error: unknown) {
                console.error(`Error deleting user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
    },
    Subscription: {
        userEvent: {
            subscribe: () => pubsub.asyncIterator([USER_EVENT]),
        },
    },
};

export default resolvers;
