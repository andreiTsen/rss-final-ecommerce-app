import ElementCreator from '../../utils/ElementCreator';
import './../aboutPage/aboutPage.css';

export default class AboutPage {
  private container: HTMLElement;
  constructor(container: HTMLElement) {
    this.container = container;
    this.container.appendChild(this.createContainerPage());
  }

  public createContainerPage(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['about-container'],
    });

    const title = this.createContainerTitle();
    const intro = this.createIntro();
    const commonInfo = this.createCommonInfoAboutCommand(
      'Вы наверное спросите, почему наш сайт выглядит так нелепо, зададите себе вопрос, кто его делал - психически неуровновешенные люди или пациенты медицинской марихуаны? Мы вам ответим нет - мы просто команда энтузиастов собраная всевышней волей великого рандома. Наша команда понимает, что сайт кривой, но мы по прежнему будем делать вид, что так и было задумано!)'
    );
    const footer = this.createFooter();

    container.getElement().append(title);
    container.getElement().append(intro);
    container.getElement().append(this.createDevContainer());
    container.getElement().append(commonInfo);
    container.getElement().append(footer);
    return container.getElement();
  }

  public createDevContainer(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('container_developer');
    const development1 = this.createDeveloper(
      'dev-1',
      'https://github.com/andreiTsen',
      ' Team-Lead and developer',
      ` Родился в Гомеле. В 2016 году переехал в Польшу. Закончил Белостоцкий Университет по специальности международные отношения. Магистр международных отношений. Свободно использую белорусский, русский, польский языки, усиленно изучаю английский. Опыт в програмировании чуть больше года. Когда попробовал впервые написать код - затянуло, так как люблю решать логические задачи. Люблю путешествовать, хороший рок и читать книги.`,
      ` Занимался координацией деятельности команды, распределял задачи между членами команды, организовывал созвоны, помогал в решении различных проблем на этапе разработки, активно учавствовал в разработке сайта. Были разработаны страницы: регистрация пользователей, каталог товаров. Занимался интеграцией ecommerce, организацией trello дашборда, настройкой репозитория.`,
      'Andrei Tseniuta',
      'andreiTsen'
    );
    const development2 = this.createDeveloper(
      'dev-2',
      'https://github.com/Arkhipenka',
      ' Developer',
      ` Родился в Бобруйске, с 2020 года живу в Гданьске. Окончил истфак БГУ и Гданьский факультет, магистр политолог. Лауреат ряда премий в сфере гражданского активизма, знаю как минимум 3 нобелевских лауреатов. Владею, русским, белорусским, польским, английским и учу традиционный китайский. Вечно в прокрастинации и в эмоциональном выгорании, это уже 18 попытка завершить курс. Вечно анализирую и занимаюсь самокопанием. Безнадежный романтик и идеалист в поисках смысла и своего места в этом безумном и насправедливом мире.`,
      ` Активно учавствовал в процессе разработки сайта. Занимался настройкой репозитория, разработкой страницы профиля пользователя, корзины, навигации.`,
      'Andrei Arkhipenka',
      'Arkhipenka'
    );
    const development3 = this.createDeveloper(
      'dev-3',
      'https://github.com/alexanderkalyupanov',
      ' Developer',
      ` Родился и вырос в городе Новозыбкове Брянской области, на данный момент проживаю в городе Брянске. С детства всегда привлекали компьютеры и техника, после окончания школы пришло время определяться с дальнейшим путём развития - выбрал обучение в колледже на программиста. В процессе обучения в колледже очень сильно разочаровался в качестве обучения и знаний, начал учиться самостоятельно, выбрав направление веб-разработки. В настоящий момент продолжаю обучение в данном направлении, так как вижу для себя перспективу в нём. Люблю изучать что-то новое, саморазвиваться, читать книги, работать над собой, также спорт является неотъемлемой частью моей жизни.`,
      ` Активно учавствовал в процессе разработки сайта, были разработаны - страница входа, подробная страница продукта, страница с информацией о разработчиках. Занимался настройкой проекта.`,
      'Alexander Kalyupanov',
      'alexanderkalyupanov'
    );
    container.append(development1, development2, development3);
    return container;
  }

  public createDeveloper(
    classname: string,
    href: string,
    role: string,
    info: string,
    text: string,
    name: string,
    git: string
  ): HTMLElement {
    const containerDeveloper = this.createContainerDeveloper();
    const imgDeveloper = this.createImgDeveloper(classname);
    const containerInfoDeveloper = this.createInfoDeveloperContainer();
    const nameDeveloper = this.createNameBox(name, href, git);
    const roleDeveloper = this.createRoleDeveloper(role);
    const aboutInfoDeveloper = this.createAboutDeveloper(info);
    const contributionDeveloper = this.createContributionDeveloper(text);
    containerDeveloper.append(imgDeveloper, containerInfoDeveloper);
    containerInfoDeveloper.append(nameDeveloper, roleDeveloper, aboutInfoDeveloper, contributionDeveloper);

    return containerDeveloper;
  }

  public createIntro(): HTMLElement {
    const intro = new ElementCreator({
      tagName: 'p',
      classNames: ['about-intro'],
      textContent:
        'Наша команда состоит из людей, которые всегда готовы идти до конца, несмотря на все трудности. Грамотная командная работа, взаимная помощь друг другу помогли нам дойти до конца и не свернуть с этого пути.',
    });
    return intro.getElement();
  }

  public createContainerTitle(): HTMLElement {
    const aboutTitle = new ElementCreator({
      tagName: 'h1',
      classNames: ['about-title'],
      textContent: 'About us',
    });
    return aboutTitle.getElement();
  }

  public createContainerDeveloper(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['about-dev__container'],
    });
    return container.getElement();
  }

  public createImgDeveloper(classname: string): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['about-img__container'],
    });
    const img = new ElementCreator({
      tagName: 'img',
      classNames: ['about-img', classname],
    });
    container.addInnerElement(img);
    return container.getElement();
  }

  public createInfoDeveloperContainer(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['about-dev__info-box'],
    });
    return container.getElement();
  }

  public createNameBox(name: string, href: string, text: string): HTMLElement {
    const containerName = new ElementCreator({
      tagName: 'div',
      classNames: ['about-dev__name-box'],
    });
    const nameDeveloper = new ElementCreator({
      tagName: 'h2',
      classNames: ['about-dev__name'],
      textContent: name,
    });
    const linkBox = new ElementCreator({
      tagName: 'div',
      classNames: ['about-dev__link-box'],
    });
    const link = new ElementCreator({
      tagName: 'a',
      classNames: ['about-dev__link'],
      attribute: [`href=${href}`, 'target=_blank'],
    });
    const img = new ElementCreator({
      tagName: 'div',
      classNames: ['about-dev__link-img'],
    });
    const span = new ElementCreator({
      tagName: 'span',
      classNames: ['about-dev__link-name'],
      textContent: text,
    });
    linkBox.addInnerElement(link);
    link.addInnerElement(img);
    link.addInnerElement(span);
    containerName.addInnerElement(nameDeveloper);
    containerName.addInnerElement(linkBox);
    return containerName.getElement();
  }

  public createRoleDeveloper(role: string): HTMLElement {
    const roleDeveloper = new ElementCreator({
      tagName: 'h3',
      classNames: ['about-dev__role'],
    });
    const span = new ElementCreator({
      tagName: 'span',
      classNames: ['about-dev__role-span'],
      textContent: 'Роль:',
    });
    roleDeveloper.addInnerElement(span);
    roleDeveloper.addTextContent(`${role}`);
    return roleDeveloper.getElement();
  }

  public createAboutDeveloper(info: string): HTMLElement {
    const aboitInfo = new ElementCreator({
      tagName: 'p',
      classNames: ['about-dev__info'],
    });
    const span = new ElementCreator({
      tagName: 'span',
      classNames: ['about-dev__info-span'],
      textContent: 'О разработчике:',
    });
    aboitInfo.addInnerElement(span);
    aboitInfo.addTextContent(`${info}`);
    return aboitInfo.getElement();
  }

  public createContributionDeveloper(text: string): HTMLElement {
    const contributionInfo = new ElementCreator({
      tagName: 'p',
      classNames: ['about-dev__contribution'],
    });
    const span = new ElementCreator({
      tagName: 'span',
      classNames: ['about-dev__info-span'],
      textContent: 'Вклад в проект:',
    });
    contributionInfo.addInnerElement(span);
    contributionInfo.addTextContent(`${text}`);
    return contributionInfo.getElement();
  }

  public createCommonInfoAboutCommand(text: string): HTMLElement {
    const info = new ElementCreator({
      tagName: 'p',
      classNames: ['about-dev__common--info'],
      textContent: text,
    });
    return info.getElement();
  }

  public createFooter(): HTMLElement {
    const footer = new ElementCreator({
      tagName: 'footer',
      classNames: ['footer'],
    });
    const footerLink = new ElementCreator({
      tagName: 'a',
      classNames: ['footer-link'],
      attribute: ['href=https://rs.school/courses/javascript-ru', 'target=_blank'],
    });
    const footerLogo = new ElementCreator({
      tagName: 'div',
      classNames: ['footer-logo'],
    });
    footerLink.addInnerElement(footerLogo);
    footer.addInnerElement(footerLink);
    return footer.getElement();
  }
}
