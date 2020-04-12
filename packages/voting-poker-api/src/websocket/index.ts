import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

export const connect = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};

export const disconnect = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};

export const message = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};