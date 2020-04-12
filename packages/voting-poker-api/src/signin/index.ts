import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

type SignInRequest = {
    name: string;
    sessionId?: string;
}

type VoterState = {
    id: string;
    name: string;
    voted: boolean;
    moderator: boolean;
}

const parse = (event: APIGatewayProxyEvent): SignInRequest => {
    if (!event.body) {
        throw new Error('Empty event body');
    }

    try {
        return JSON.parse(event.body) as SignInRequest;
    } catch (error) {
        throw new Error(`Malformed event body JSON: ${event.body}`);
    }
};

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const request = parse(event);

    const voter: VoterState = {
        id: event.requestContext.requestId,
        name: request.name,
        moderator: true,
        voted: false,
    };

    return {
        body: JSON.stringify(voter),
        statusCode: 200,
    };
};