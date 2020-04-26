import {connect, disconnect, message} from './index';

describe('connect', () => {
    it('returns a stub response', async () => {
        await expect(connect({})).resolves.toEqual({
            body: 'OK',
            statusCode: 200,
        });
    });
});

describe('disconnect', () => {
    it('returns a stub response', async () => {
        await expect(disconnect({})).resolves.toEqual({
            body: 'OK',
            statusCode: 200,
        });
    });
});

describe('message', () => {
    it('returns a stub response', async () => {
        await expect(message({})).resolves.toEqual({
            body: 'OK',
            statusCode: 200,
        });
    });
});