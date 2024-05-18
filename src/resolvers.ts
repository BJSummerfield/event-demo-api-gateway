type User = {
    id: string;
    name: string;
    birthday: string;
};

const users: User[] = [
    { id: '1', name: 'John Doe', birthday: '1990-01-01' },
    { id: '2', name: 'Jane Doe', birthday: '1992-02-02' },
];

const resolvers = {
    Query: {
        getUser: (_: any, { id }: { id: string }, ___: any) => {
            return users.find(user => user.id === id);
        },
        getAllUsers: (_: any, __: any, ___: any) => {
            return users;
        },
    },
    Mutation: {
        updateUser: (_: any, { id, name, birthday }: { id: string; name?: string; birthday?: string }, ___: any) => {
            const user = users.find(user => user.id === id);
            if (!user) throw new Error('User not found');
            if (name) user.name = name;
            if (birthday) user.birthday = birthday;
            return user;
        },
    },
};

export default resolvers;
