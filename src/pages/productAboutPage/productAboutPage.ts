import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import ElementCreator from '../../utils/ElementCreator';
import './../../pages/productAboutPage/productAboutPage.css';
import 'swiper/swiper-bundle.css';
import { CartData, CartLineItem, CartService } from './../../services/cartService';

export default class productAboutPage {
  private container: HTMLElement;
  constructor(
    container: HTMLElement,
    title: string,
    info: string,
    price: string,
    imgs: string[],
    category: string,
    author: string,
    discountedPrice: string,
    pages: string,
    productId: string
  ) {
    this.container = container;
    this.container.appendChild(
      this.createContainerPage(title, info, price, imgs, category, author, discountedPrice, pages, productId)
    );
  }

  public createContainerPage(
    title: string,
    info: string,
    price: string,
    imgs: string[],
    category: string,
    author: string,
    discountedPrice: string,
    pages: string,
    productId: string
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
    infoContainer.appendChild(this.createPages(pages));
    infoContainer.appendChild(this.createAboutInfoProducts(info));
    infoContainer.appendChild(this.createPriceProducts(price, discountedPrice));
    infoContainer.appendChild(this.createButtons(productId));
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
      textContent: `${title}`,
    });

    return titleElement.getElement();
  }

  public createAboutInfoProducts(info: string): HTMLElement {
    const infoElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-info'],
      textContent: `About the book: ${info}`,
    });
    return infoElement.getElement();
  }

  public createCategories(category: string): HTMLElement {
    const categoryElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-category'],
      textContent: `Category: ${category}`,
    });

    return categoryElement.getElement();
  }

  public createAuthor(author: string): HTMLElement {
    const authorElement = new ElementCreator({
      tagName: 'span',
      classNames: ['about-page_product-author'],
      textContent: `Author: ${author}`,
    });

    return authorElement.getElement();
  }

  public createAddAndremoveButton(): { addButton: HTMLButtonElement; removeButton: HTMLButtonElement } {
    const addButton = new ElementCreator({
      tagName: 'button',
      classNames: ['about-page_product-btn-buy'],
      textContent: 'Добавить в корзину',
    }).getElement();
    if (!(addButton instanceof HTMLButtonElement)) {
      throw new Error('addButton is not HTMLButtonElement');
    }
    const removeButton = new ElementCreator({
      tagName: 'button',
      classNames: ['about-page_product-btn-remove'],
      textContent: 'Удалить из корзины',
    }).getElement();
    if (!(removeButton instanceof HTMLButtonElement)) {
      throw new Error('addButton is not HTMLButtonElement');
    }
    return { addButton, removeButton };
  }

  public showNotice(message: string): void {
    const notice = new ElementCreator({
      tagName: 'div',
      classNames: ['custom-toast'],
      textContent: message,
    });
    document.body.appendChild(notice.getElement());
    setTimeout(() => {
      notice.getElement().classList.add('custom-toast--hide');
      setTimeout(() => notice.getElement().remove(), 300);
    }, 2000);
  }

  public createButtons(productId: string): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('about-page_cart-btns');
    const { addButton, removeButton } = this.createAddAndremoveButton();
    addButton.style.display = '';
    removeButton.style.display = 'none';
    const update = (cart: CartData): void => {
      const inCart = cart.lineItems.some((item: CartLineItem) => item.productId === productId);
      addButton.disabled = inCart;
      addButton.style.display = inCart ? 'none' : '';
      removeButton.disabled = !inCart;
      removeButton.style.display = inCart ? '' : 'none';
    };
    CartService.getOrCreateCart().then(update).catch(console.error);
    CartService.onCartUpdate(update);
    addButton.onclick = async (): Promise<void> => {
      addButton.disabled = true;
      try {
        await CartService.addProductToCart(productId, 1);
        this.showNotice('Товар успешно добавлен в корзину!');
      } catch {
        addButton.disabled = false;
        alert('Ошибка при добавлении в корзину');
      }
    };
    removeButton.onclick = async (): Promise<void> => {
      removeButton.disabled = true;
      try {
        const cart = await CartService.getOrCreateCart();
        const item = cart.lineItems.find((i: CartLineItem) => i.productId === productId);
        if (item) await CartService.removeProductFromCart(item.id);
        this.showNotice('Товар удалён из корзины!');
      } catch {
        removeButton.disabled = false;
        alert('Ошибка при удалении из корзины');
      }
    };
    container.append(addButton, removeButton);
    return container;
  }

  public createPages(pages: string): HTMLElement {
    const pagesElement = new ElementCreator({
      tagName: 'span',
      classNames: ['about-page_product-pages'],
      textContent: `Number of pages: ${pages}`,
    });

    return pagesElement.getElement();
  }

  public createPriceProducts(price: string, discountedPrice: string | null = null): HTMLElement {
    const priceElement = new ElementCreator({
      tagName: 'p',
      classNames: ['about-page_product-price'],
    });
    if (discountedPrice) {
      const oldPrice = document.createElement('span');
      oldPrice.className = 'old-price';
      oldPrice.textContent = `${price}$`;

      const newPrice = document.createElement('span');
      newPrice.className = 'new-price';
      newPrice.textContent = ` ${discountedPrice}$`;

      priceElement.getElement().appendChild(oldPrice);
      priceElement.getElement().appendChild(newPrice);
    } else {
      priceElement.getElement().textContent = `Price: ${price}$`;
    }

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
      classNames: ['modal-product'],
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
