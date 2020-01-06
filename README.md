## Floor navigation

A floor navigation component based on native js.

### Usage

Please write the style yourself.

install [`floor-navigation npm`](https://www.npmjs.com/package/floor-navigation).

``` bash
npm i floor-navigation --save
```

import floor-navigation.

```
import Floornav from 'floor-navigation';

new Floornav('floor', {
  base: 'top',
  isToggleShow: false,
});
```

### The API

| key | description  | default | options|
| :------------ |:---------------|:-----|:----|
| `container` | scroll container | window | `window` / `string` |
| `base`      | baseline  |   0 | `top`/ `center`/ `bottom` |
| `threshold` | the offset from baseline  |  0 | `number` |
| `scrollOffset` | are neat |   0 | `number` |
| `activeClass` | the active class of the current floor item  | `active` | `string`  |
| `showClass` |  class at the floor display      |   `show` | `string` |
| `isToggleShow` | Whether the floor disappears with the content  | `true` | `boolean` |
