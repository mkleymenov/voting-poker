import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

export const signInHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};

export const websocketHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};