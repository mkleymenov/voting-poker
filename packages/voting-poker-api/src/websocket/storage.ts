const CONNECTIONS: { [voterId: string]: string } = {};

export const addVoterConnection = async (
    voterId: string,
    connectionId: string,
): Promise<string> => {
    CONNECTIONS[voterId] = connectionId;
    return Promise.resolve(connectionId);
};

export const getVoterConnection = async (voterId: string): Promise<string | undefined> => {
    return Promise.resolve(CONNECTIONS[voterId]);
};