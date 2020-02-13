## Floor navigation

> Thanks to [Floornav](https://github.com/athm-fe/floornav)

A floor navigation component based on typescript and vanilla js.

### HTML

``` html
<div id="floornav">
  <a href="#floor1">1楼</a>
  <a href="#floor2">2楼</a>
  <a href="#floor3">3楼</a>
  <a href="#floor4">4楼</a>
  <a href="#floor5">5楼</a>
  <a href="#floor6">6楼</a>
</div>

<div class="floor">占位</div>
<div id="floor1" class="floor">这是1楼</div>
<div id="floor2" class="floor">这是2楼</div>
<div id="floor3" class="floor">这是3楼</div>
<div id="floor4" class="floor">这是4楼</div>
<div id="floor5" class="floor">这是5楼</div>
<div id="floor6" class="floor">这是6楼</div>
<div class="floor">占位</div>
```

### Usage

Please write the style yourself.

install [`floor-navigation npm`](https://www.npmjs.com/package/floor-navigation).

``` bash
npm i floor-navigation --save
```

import floor-navigation.

``` js
import Floornav from 'floor-navigation';

new Floornav({
  id: 'floornav',
  base: 'top',
  isToggleShow: false,
  ...
});
```

### The API

#### Options

| key | description  | default | options|
| :------------ |:---------------|:-----|:----|
| `id` | the id of the floor element | `undefined` | `string` |
| `container` | scroll container | `window` | `window` / `string` |
| `base`      | baseline  |   0 | `top`/ `center`/ `bottom` |
| `threshold` | threshold  |  0 | `number` |
| `scrollOffset` | the offset from baseline |   0 | `number` |
| `activeClass` | the active class of the current floor item  | `active` | `string`  |
| `showClass` |  class at the floor display      |   `show` | `string` |
| `isToggleShow` | Whether the floor disappears with the content  | `true` | `boolean` |
| `navActiveCallback` | the navigation active callback | -- | `function` |
