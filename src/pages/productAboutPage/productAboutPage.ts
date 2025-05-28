import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import ElementCreator from '../../utils/ElementCreator';
import './../../pages/productAboutPage/productAboutPage.css';
import 'swiper/swiper-bundle.css';
export default class productAboutPage {
  private container: HTMLElement;
  constructor(
    container: HTMLElement,
    title: string,
    info: string,
    price: string,
    imgs: string[],
    category: string,
    author: string
  ) {
    this.container = container;
    this.container.appendChild(this.createContainerPage(title, info, price, imgs, category, author));
  }

  public createContainerPage(
    title: string,
    info: string,
    price: string,
    imgs: string[],
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
    if (imgs.length > 1) {
      imgContainer.appendChild(this.createSlider(imgs));
    } else {
      imgContainer.appendChild(this.createImgProducts(imgs[0]));
    }
    infoContainer.appendChild(this.createCategories(category));
    infoContainer.appendChild(this.createAuthor(author));
    infoContainer.appendChild(this.createAboutInfoProducts(info));
    infoContainer.appendChild(this.createPriceProducts(price));
    infoContainer.appendChild(this.createBtnBuyProduct());
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

  public createBtnBuyProduct(): HTMLElement {
    const buttonBuyProduct = new ElementCreator({
      tagName: 'button',
      classNames: ['about-page_product-btn-buy'],
      textContent: `Добавить в корзину`,
    });
    return buttonBuyProduct.getElement();
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
    imgElement.setCallback(() => this.createImgModal([img]));
    imgElement.setAttributes([`src=${img}`]);
    return imgElement.getElement();
  }

  public createSlider(imgs: string[]): HTMLElement {
    const sliderContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper'],
    }).getElement();
    const wrapper = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper-wrapper'],
    }).getElement();
    imgs.forEach((img) => {
      const slide = new ElementCreator({
        tagName: 'div',
        classNames: ['swiper-slide'],
      }).getElement();
      const image = new ElementCreator({
        tagName: 'img',
        classNames: ['about-page_product-img'],
      }).getElement();
      image.setAttribute('src', img);
      image.addEventListener('click', () => this.createImgModal(imgs));
      slide.appendChild(image);
      wrapper.appendChild(slide);
    });
    sliderContainer.appendChild(wrapper);
    const pagination = this.createPaginationElement();
    const buttonNext = this.createButtonNext();
    const buttonPrevious = this.createButtonPrevious();
    sliderContainer.appendChild(pagination);
    sliderContainer.appendChild(buttonNext);
    sliderContainer.appendChild(buttonPrevious);
    setTimeout(() => {
      new Swiper(sliderContainer, {
        modules: [Navigation, Pagination],
        loop: true,
        pagination: { el: pagination, clickable: true },
        navigation: { nextEl: buttonNext, prevEl: buttonPrevious },
      });
    }, 0);
    return sliderContainer;
  }

  public createPaginationElement(): HTMLElement {
    const pagination = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper-pagination'],
    });
    return pagination.getElement();
  }

  public createButtonNext(): HTMLElement {
    const nextButton = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper-button-next'],
    });
    return nextButton.getElement();
  }

  public createButtonPrevious(): HTMLElement {
    const previousButton = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper-button-prev'],
    });
    return previousButton.getElement();
  }

  public createImgModal(imgs: string[]): void {
    const modal = new ElementCreator({
      tagName: 'div',
      classNames: ['modal'],
    });
    const modalContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['modal-container'],
    });

    const closeButton = this.createModalCloseButton(() => document.body.removeChild(modal.getElement()));
    const sliderContainer = this.createModalSlider(imgs);

    modal.setCallback((event: Event) => {
      if (event.target === modal.getElement()) {
        document.body.removeChild(modal.getElement());
      }
    });

    modalContainer.addInnerElement(closeButton);
    modalContainer.addInnerElement(sliderContainer.container);
    modal.addInnerElement(modalContainer);
    document.body.appendChild(modal.getElement());

    setTimeout(() => {
      new Swiper(sliderContainer.swiperEl, {
        modules: [Navigation, Pagination],
        loop: true,
        pagination: { el: sliderContainer.pagination, clickable: true },
        navigation: { nextEl: sliderContainer.buttonNext, prevEl: sliderContainer.buttonPrevious },
      });
    }, 0);
  }

  private createModalCloseButton(click: () => void): HTMLElement {
    const closeButton = new ElementCreator({
      tagName: 'button',
      classNames: ['modal-close_btn'],
    });
    closeButton.addTextContent('×');
    closeButton.setCallback(click);
    return closeButton.getElement();
  }

  private createModalSlider(imgs: string[]): {
    container: HTMLElement;
    swiperEl: HTMLElement;
    pagination: HTMLElement;
    buttonNext: HTMLElement;
    buttonPrevious: HTMLElement;
  } {
    const sliderContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper', 'modal-swiper'],
    });
    const wrapper = new ElementCreator({
      tagName: 'div',
      classNames: ['swiper-wrapper'],
    });
    imgs.forEach((img) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      const imageSlide = document.createElement('img');
      imageSlide.classList.add('modal-image');
      imageSlide.src = img;
      slide.appendChild(imageSlide);
      wrapper.addInnerElement(slide);
    });
    sliderContainer.addInnerElement(wrapper);
    const pagination = this.createPaginationElement();
    const buttonNext = this.createButtonNext();
    const buttonPrevious = this.createButtonPrevious();
    sliderContainer.addInnerElement(pagination);
    sliderContainer.addInnerElement(buttonNext);
    sliderContainer.addInnerElement(buttonPrevious);

    return {
      container: sliderContainer.getElement(),
      swiperEl: sliderContainer.getElement(),
      pagination,
      buttonNext,
      buttonPrevious,
    };
  }
}
