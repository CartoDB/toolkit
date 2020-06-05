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
    const categoryWidget = this.element as any;

    Object.keys(this.options).forEach(option => {
      categoryWidget[option] = this.options[option];
    });

    await this.updateData();
  }

  protected async updateData() {
    const data = await this.dataView.getData();
    const categoryWidget = this.element as HTMLAsCategoryWidgetElement;
    categoryWidget.categories = data.categories;
  }
}

interface CategoryWidgetOptions {
  valueFormatter?: (value: string | number) => string | number;
  [key: string]: unknown;
}

interface HTMLAsCategoryWidgetElement {
  categories?: Category[];
}

interface Category {
  name: string;
  value: number;
  color?: string;
}
