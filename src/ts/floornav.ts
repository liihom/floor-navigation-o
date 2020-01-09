interface Iconfig {
  container?: any;
  base?: string;
  threshold?: number;
  scrollOffset?: number;
  activeClass?: string;
  showClass?: string;
  isToggleShow?: boolean;
}

interface Nav {
  id: string,
  config: Iconfig
}

class DefaultConfig implements Iconfig {
  container: object = window;
  base: string = 'center';
  threshold: number = 0;
  scrollOffset: number = 0;
  activeClass: string = 'active';
  showClass: string = 'show';
  isToggleShow: boolean = true;
}

class Floornav implements Nav {
  id: string;
  config: Iconfig;
  navContainerId: string | undefined;
  navContainerEl: HTMLElement | null;
  navItems: NodeListOf<Element> | null;
  floorItmes: Array<Element | null> = [];
  update: () => void;

  private defaultConfig: Iconfig = new DefaultConfig();

  constructor(id: string, config?: Iconfig) {
    this.id = id;
    this.defaultConfig = new DefaultConfig();
    this.config = {
      ...this.defaultConfig,
      ...config,
    };

    const navContainerEl = document.getElementById(this.id);
    this.navContainerEl = navContainerEl;
    this.navItems = this.id ? document.querySelectorAll(`#${this.id} a[href]`) : null;

    // nodelist foreach
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    this.update = () => {
      this._initItems();
      this.init();
    }

    this.init();
  }

  init() {
    if (!this.navContainerEl) {
      console.warn("[Floornav warning]: can't find the wrapper element of the floor navigation");
      return;
    }

    this._initItems();
    this._initJump();
    this._initCheck();

    // check start
    this._check();
  }

  private _initItems() {
    this.floorItmes = [];

    this.navItems && this.navItems.forEach((elem) => {
      const href = elem.getAttribute('href');
      if (href) {
        const floorItem = document.getElementById(href.slice(1));
        this.floorItmes.push(floorItem);
      }
    });
  }

  private _setItemActive(elem: Element) {
    const activeNavItem = document.querySelector(`#${this.id} a.active[href]`);
    if (activeNavItem) {
      activeNavItem.classList.remove('active');
    }
    elem.classList.add('active');
  }

  private _check() {
    const { threshold, base, container } = this.config;
    const height = container.innerHeight;
    let baseline;
    let containerTop = 0;

    if (container !== window) {
      const containerEl = document.getElementById(container);
      containerTop = containerEl ? containerEl.getBoundingClientRect().top : 0;
    }

    if (base === 'top') {
      baseline = containerTop;
    } else if (base === 'bottom') {
      baseline = containerTop + height;
    } else {
      baseline = containerTop + height / 2;
    }

    if (!this.config.isToggleShow) {
      this.navContainerEl && (this.navContainerEl.style.display = 'block');
      this.navContainerEl && this.navContainerEl.classList.add('show');
    } else {
      const firstFloorEl = this.floorItmes[0];
      if (firstFloorEl && firstFloorEl.getBoundingClientRect().top <= baseline + threshold) {
        this.navContainerEl && (this.navContainerEl.style.display = 'block');
        setTimeout(() => {
          this.navContainerEl && this.navContainerEl.classList.add('show');
        }, 0);
      } else {
        this.navContainerEl && (this.navContainerEl.style.display = 'none');
        this.navContainerEl && this.navContainerEl.classList.remove('show');
      }
    }

    for (let i = this.floorItmes.length - 1; i >= 0; i--) {
      const currentFloorItem = this.floorItmes[i];
      // 注：getBoundingClientRect().top 和 offsetTop 计算出来的位置有偏差，base 为 top 时能体现，暂时多加1像素
      if (currentFloorItem && currentFloorItem.getBoundingClientRect().top <= baseline + threshold + 1) { // eslint-disable-line
        const id = currentFloorItem.getAttribute('id');
        const $item = document.querySelector(`#${this.id} a[href="#${id}"]`);
        $item && this._setItemActive($item);
        break;
      }
    }
  }

  private _fnCheck = () => {
    this._check();
  }

  private _initJump() {
    const self = this;
    const { container, scrollOffset } = self.config;

    this.navItems && this.navItems.forEach((item) => {
      item.addEventListener('click', (e: Event) => {
        const event = e || window.event;
        event.preventDefault();

        const navItem = item;

        if (!navItem) {
          return;
        }

        // 获取对应楼层
        const href = navItem.getAttribute('href');
        let floorItem;
        if (href) {
          floorItem = document.getElementById(href.slice(1));
        }

        // 高亮当前导航项
        self._setItemActive(navItem);

        // 计算距离，滚动显示导航器对应的楼层
        let containerTop = 0;
        if (container !== window) {
          const rectTop = container.getBoundingClientRect().top;
          const pageYOffset = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0); // eslint-disable-line
          const offsetTop = rectTop + pageYOffset;
          containerTop = offsetTop - container.scrollTop;
        }
        if (floorItem) {
          const rectTop = floorItem.getBoundingClientRect().top;
          const pageYOffset = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0); // eslint-disable-line
          const offsetTop = rectTop + pageYOffset;
          const scrollTo = offsetTop - (scrollOffset || 0) - containerTop;

          self._scrollTo(floorItem, scrollTo, 300);
        }
      });
    });
  }

  private _initCheck() {
    const _self = this;
    _self.config.container.addEventListener('scroll', this._fnCheck);
    _self.config.container.addEventListener('resize', this._fnCheck);
  }

  private _scrollTo(target: Element, scrollTo: number, time: number = 300) {
    if (!target) {
      return;
    }

    const _self = this;
    const { container } = _self.config;

    container.removeEventListener('scroll', this._fnCheck);
    container.removeEventListener('resize', this._fnCheck);

    const scrollFrom = document.documentElement.scrollTop || document.body.scrollTop;
    let i = 0;
    const runEvery = 5;
    time /= runEvery;
    const interval = setInterval(function () {
      i++;
      const targetValue = (scrollTo - scrollFrom) / time * i + scrollFrom;
      document.documentElement.scrollTop = document.body.scrollTop = targetValue; // eslint-disable-line
      if (i >= time) {
        clearInterval(interval);

        _self._initCheck();
      }
    }, runEvery);
  }
}

export default Floornav;
