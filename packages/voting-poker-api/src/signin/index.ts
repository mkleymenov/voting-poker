import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        body: 'OK',
        statusCode: 200,
    };
};