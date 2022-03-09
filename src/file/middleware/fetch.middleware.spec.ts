import { FetchMiddleware } from './fetch.middleware';

describe('FetchMiddleware', () => {
  it('should be defined', () => {
    expect(new FetchMiddleware()).toBeDefined();
  });
});
