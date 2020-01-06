interface Iconfig {
  container: any; // 滚动容器 window 或 id
  base: string; // 计算区块位置的参照线, 值可以为 'center', 'top', 'bottom'
  threshold: number; // 距离参照线多远即认为区块出现
  scrollOffset: number; // 滚动差值, 假如页面有吸顶元素, 点击导航滚动到对应楼层时会被遮挡, 所以提供了这个参数来解决问题
  activeClass: string; // 导航器当前项样式
  showClass: string; // 导航器显示时添加的样式
  isToggleShow: boolean; // 导航器是否要隐藏，默认为第一楼层出现后展示
}

class Floornav {
  config: Iconfig
  private defaultConfig: Iconfig = {
    container: window,
    base: 'center',
    threshold: 0,
    scrollOffset: 0,
    activeClass: 'active',
    showClass: 'show',
    isToggleShow: true,
  };

  navContainerId: string;
  navContainerEl: HTMLElement | null;
  navItems: NodeListOf<Element>;
  floorItmes: Array<Element | null>;
  fnCheck: () => void;

  constructor(el: string, config?: Iconfig) {
    // 生成最终配置
    this.config = {
      ...this.defaultConfig,
      ...config,
    }

    if (!el) {
      console.warn('Floornav: not found nav element');
    }

    this.navContainerId = el;

    // 确定导航按钮父容器
    const navContainerEl = document.getElementById(el);
    this.navContainerEl = navContainerEl;

    if (!this.navContainerEl) {
      console.warn('Floornav: not found nav container element');
    }

    // 搜集导航按钮
    this.navItems = document.querySelectorAll(`#${this.navContainerId} a[href]`);

    // nodelist foreach
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    // 搜集楼层列表
    this.floorItmes = [];
    this.navItems.forEach((elem) => {
      const href = elem.getAttribute('href');
      if (href) {
        const floorItem = document.getElementById(href.slice(1));
        this.floorItmes.push(floorItem);
      }
    });

    // 滚动所绑定的检测方法，绑定 this 为 Floornav
    this.fnCheck = this._check.bind(this);

    this.init();
  }

  init() {
    if (!this.navContainerEl) {
      return;
    }
    this._initJump();
    this._initCheck();

    // 初始时进行检测
    this._check();
  }

  _setItemActive(elem: Element) {
    const activeNavItem = document.querySelector(`#${this.navContainerId} a.active[href]`);
    if (activeNavItem) { // null || element
      activeNavItem.classList.remove('active');
    }
    elem.classList.add('active');
  }

  _check() {
    const { threshold, base, container } = this.config;
    const height = container.innerHeight;
    let baseline;
    let containerTop = 0;

    // ie window.innerHeight

    if (container !== window) {
      const containerEl = document.getElementById(container);
      containerTop = containerEl ? containerEl.getBoundingClientRect().top : 0;
    }

    // 计算参考线位置
    if (base === 'top') {
      baseline = containerTop;
    } else if (base === 'bottom') {
      baseline = containerTop + height;
    } else {
      baseline = containerTop + height / 2;
    }

    // 如果导航器显示参数为 true
    if (!this.config.isToggleShow) {
      this.navContainerEl && (this.navContainerEl.style.display = 'block');
      this.navContainerEl && this.navContainerEl.classList.add('show');
    } else { // 当滚动出现第一个楼层时, 导航器出现; 否则, 隐藏
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

    // 判断是否有楼层出现
    for (let i = this.floorItmes.length - 1; i >= 0; i--) {
      const currentFloorItem = this.floorItmes[i];
      // 注：getBoundingClientRect().top 和 offsetTop 计算出来的位置有偏差，base 为 top时能体现，暂时多加1像素
      if (currentFloorItem && currentFloorItem.getBoundingClientRect().top <= baseline + threshold + 1) { // eslint-disable-line
        const id = currentFloorItem.getAttribute('id');
        const $item = document.querySelector(`#${this.navContainerId} a[href="#${id}"]`);
        $item && this._setItemActive($item);
        break;
      }
    }
  }

  public _initJump() {
    const self = this;
    const { container, scrollOffset } = self.config;

    this.navItems.forEach((item) => {
      // 为导航项添加点击事件
      item.addEventListener('click', (e: Event) => {
        const event = e || window.event;
        event.preventDefault();

        // 所点击的导航项
        const that = item;
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
        self._setItemActive(that);

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
          const scrollTo = offsetTop - scrollOffset - containerTop;
          // 平滑滚动到指定楼层
          self._scrollTo(floorItem, scrollTo, 300);
        }
      });
    });
  }

  _initCheck() {
    this.config.container.addEventListener('scroll', this.fnCheck);
    this.config.container.addEventListener('resize', this.fnCheck);
  }

  _scrollTo(target: Element, scrollTo: number, time: number = 300) {
    if (!target) {
      return;
    }

    const _self = this;
    const { container } = _self.config;

    // 暂时取消滚动检测
    container.removeEventListener('scroll', _self.fnCheck);
    container.removeEventListener('resize', _self.fnCheck);

    // 缓动
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

        // 恢复滚动检测
        _self._initCheck();
      }
    }, runEvery);
  }
}

export default Floornav;
