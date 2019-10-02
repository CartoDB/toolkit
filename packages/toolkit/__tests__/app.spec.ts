import { App } from '../src/index';

describe('App API', () => {
  it('should pass', () => {
    const app = new App();

    expect(app).not.toBeNull();
  });
});
