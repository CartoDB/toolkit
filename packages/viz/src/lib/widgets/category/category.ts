import { CategoryDataView } from '@carto/toolkit-data';
import { Widget } from '../widget';

export class CategoryWidget extends Widget {
  private options: CategoryWidgetOptions = {};

  constructor(
    element: string | HTMLElement,
    dataView: CategoryDataView,
    options: CategoryWidgetOptions = {}
  ) {
    super(element, dataView);
    this.options = options;

    this.bindEvents();
    this.initializeWidget();
  }

  protected bindEvents() {
    super.bindEvents();
  }

  private async initializeWidget() {
    // Options
    Object.keys(this.options).forEach(option => {
      (this.element as any)[option] = (this.options as Record<string, unknown>)[
        option
      ];
    });

    await this.updateData();
  }

  protected async updateData() {
    const data = await this.dataView.getData();
    (this.element as any).categories = data.categories;
  }
}

interface CategoryWidgetOptions {
  valueFormatter?: (value: string | number) => string | number;
}
