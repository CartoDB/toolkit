import { Layer } from '../src/lib/Layer';

describe('interaction popup', () => {
  const CUSTOM_PARAM = [
    {
      attr: 'pop',
      title: 'Population',
      format: d => {
        return d.format('2d');
      }
    }
  ];
  const POP_PARAM = ['pop'];

  describe('setPopupClick', () => {
    it('should show a popup when a feature is clicked with a custom title and format', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(CUSTOM_PARAM);

      // expect(() =>
      //   sizeCategoriesStyle('attributeName', {
      //     categories: [CATEGORY_1, CATEGORY_2],
      //     sizes: [2, 10]
      //   })
      // ).not.toThrow();
    });
    it('should show a popup when a feature is clicked with default title and format', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(POP_PARAM);

      // TODO
    });
    it('should do nothing if no parameter is provided', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick();

      // TODO
    });
    it('should do nothing if the parameter provided is null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(null);

      // TODO
    });
    it('should stop showing a popup with a custom title and format after call the method with no parameters', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(CUSTOM_PARAM);
      airbnbLayer.setPopupClick();

      // TODO
    });
    it('should stop showing a popup with default title and format after call the method with no parameters', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(POP_PARAM);
      airbnbLayer.setPopupClick();

      // TODO
    });
    it('should stop showing a popup with a custom title and format after call the method with null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(CUSTOM_PARAM);
      airbnbLayer.setPopupClick(null);

      // TODO
    });
    it('should stop showing a popup with default title and format after call the method with null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupClick(POP_PARAM);
      airbnbLayer.setPopupClick(null);

      // TODO
    });
  });
  describe('setPopupHover', () => {
    it('should show a popup when a feature is clicked with a custom title and format', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(CUSTOM_PARAM);

      // expect(() =>
      //   sizeCategoriesStyle('attributeName', {
      //     categories: [CATEGORY_1, CATEGORY_2],
      //     sizes: [2, 10]
      //   })
      // ).not.toThrow();
    });
    it('should show a popup when a feature is clicked with default title and format', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(POP_PARAM);

      // TODO
    });
    it('should do nothing if no parameter is provided', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover();

      // TODO
    });
    it('should do nothing if the parameter provided is null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(null);

      // TODO
    });
    it('should stop showing a popup with a custom title and format after call the method with no parameters', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(CUSTOM_PARAM);
      airbnbLayer.setPopupHover();

      // TODO
    });
    it('should stop showing a popup with default title and format after call the method with no parameters', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(POP_PARAM);
      airbnbLayer.setPopupHover();

      // TODO
    });
    it('should stop showing a popup with a custom title and format after call the method with null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(CUSTOM_PARAM);
      airbnbLayer.setPopupHover(null);

      // TODO
    });
    it('should stop showing a popup with default title and format after call the method with null', () => {
      const airbnbLayer = new Layer('listings_madrid');
      airbnbLayer.setPopupHover(POP_PARAM);
      airbnbLayer.setPopupHover(null);

      // TODO
    });
  });
});
