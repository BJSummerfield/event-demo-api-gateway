const resolvers = {
    User: {
        name: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                return await dataSources.nameService.getUserById(parent.id);
            } catch (error: unknown) {
                console.error(`Error fetching user with ID ${parent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
        birthday: async (parent: { id: string }, _: any, { dataSources }: any) => {
            try {
                return await dataSources.birthdayService.getBirthdayById(parent.id);
            } catch (error: unknown) {
                console.error(`Error fetching birthday with ID ${parent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
    },
    Query: {
        getUser: async (_: any, { id }: { id: string }, ___: any) => {
            return { id };  // Placeholder; actual fields are resolved in User type
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
        createUser: async (_: any, { id, username, birthday }: { id: string, username: string, birthday: string }, { dataSources }: any) => {
            try {
                await dataSources.nameService.createUser({ id, username });
                await dataSources.birthdayService.createBirthday({ id, birthday });
                return {
                    id,
                    name: { id, username },
                    birthday: { id, birthday },
                };
            } catch (error: unknown) {
                console.error(`Error creating user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
        updateUser: async (_: any, { id, username, birthday }: { id: string, username?: string, birthday?: string }, { dataSources }: any) => {
            try {
                if (username) {
                    await dataSources.nameService.updateUser(id, { username });
                }
                if (birthday) {
                    await dataSources.birthdayService.updateBirthday(id, { birthday });
                }

                const user = await dataSources.nameService.getUserById(id);
                const userBirthday = await dataSources.birthdayService.getBirthdayById(id);

                return {
                    id: user.id,
                    name: user.username,
                    birthday: userBirthday.birthday,
                };
            } catch (error: unknown) {
                console.error(`Error updating user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
        deleteUser: async (_: any, { id }: { id: string }, { dataSources }: any) => {
            try {
                await dataSources.nameService.deleteUser(id);
                await dataSources.birthdayService.deleteBirthday(id);
                return { id };
            } catch (error: unknown) {
                console.error(`Error deleting user with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return null;
            }
        },
    },
};

export default resolvers;
