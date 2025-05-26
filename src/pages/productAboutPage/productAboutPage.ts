import ElementCreator from '../../utils/ElementCreator';
import './../../pages/productAboutPage/productAboutPage.css';

export default class productAboutPage {
  private container: HTMLElement;
  constructor(
    container: HTMLElement,
    title: string,
    info: string,
    price: string,
    img: string,
    category: string,
    author: string
  ) {
    this.container = container;
    this.container.appendChild(this.createContainerPage(title, info, price, img, category, author));
  }

  public createContainerPage(
    title: string,
    info: string,
    price: string,
    img: string,
    category: string,
    author: string
  ): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['about-page__container'],
    });
    const imgContainer = this.createImgContainer();
    const infoContainer = this.createInfoContainer();
    infoContainer.appendChild(this.createTitleProducts(title));
    imgContainer.appendChild(this.createImgProducts(img));
    infoContainer.appendChild(this.createCategories(category));
    infoContainer.appendChild(this.createAuthor(author));
    infoContainer.appendChild(this.createAboutInfoProducts(info));
    infoContainer.appendChild(this.createPriceProducts(price));
    container.addInnerElement(imgContainer);
    container.addInnerElement(infoContainer);
    return container.getElement();
  }

  public createImgContainer(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['img-container'],
    });
    return container.getElement();
  }

  public createInfoContainer(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['info-container'],
    });
    return container.getElement();
  }

  public createTitleProducts(title: string): HTMLElement {
    const titleElement = new ElementCreator({
      tagName: 'h1',
      classNames: ['about-page_product-title'],
      textContent: `Название: ${title}`,
    });

    return titleElement.getElement();
  }

  public createAboutInfoProducts(info: string): HTMLElement {
    const infoElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-info'],
      textContent: `Описание: ${info}`,
    });

    return infoElement.getElement();
  }

  public createCategories(category: string): HTMLElement {
    const categoryElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-category'],
      textContent: `Категория: ${category}`,
    });

    return categoryElement.getElement();
  }

  public createAuthor(author: string): HTMLElement {
    const authorElement = new ElementCreator({
      tagName: 'span',
      classNames: ['about-page_product-author'],
      textContent: `Автор: ${author}`,
    });

    return authorElement.getElement();
  }

  public createPriceProducts(price: string): HTMLElement {
    const priceElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-price'],
      textContent: `Стоимость: ${price}$`,
    });
    return priceElement.getElement();
  }

  public createImgProducts(img: string): HTMLElement {
    const imgElement = new ElementCreator({
      tagName: 'img',
      classNames: ['about-page_product-img'],
    });
    imgElement.setAttributes([`src=${img}`]);
    return imgElement.getElement();
  }
}
