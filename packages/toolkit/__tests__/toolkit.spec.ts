import Toolkit from '../src/toolkit';

describe('Toolkit API', () => {
  it('should pass', () => {
    const toolkit = new Toolkit();
    // tslint:disable-next-line:no-console
    console.log(toolkit);
    expect(true).toBe(true);
  });
});
