// tslint:disable-next-line:no-var-requires
(global as any).fetch = require('jest-fetch-mock');
(global as any).getURLParams = (url: string) => {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    const params: any = {};
    let match;

    // tslint:disable-next-line:no-conditional-assignment
    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }
    return params;
};
