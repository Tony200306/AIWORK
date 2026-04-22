# Overview

`disableScroll` and `enableScroll` are JavaScript utility functions designed for controlling and managing scrolling behavior in web applications. These functions allow you to temporarily disable and re-enable scrolling, providing a simple way to prevent unwanted user interactions with the scrolling feature.

# Examples

```html
<!doctype html>
<html>
  <head>
    <meta name="description" content="[SO] Disable scrolling in all browsers" />
    <meta charset="utf-8" />
    <title>Disable scrolling</title>
  </head>
  <body>
    <div id="menu">
      <button id="enable">enable scrolling</button>
      <button id="disable">disable scrolling</button>
      <strong id="status" class="enabled">enabled</strong>
    </div>

    <div id="page">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae velit sit amet velit rhoncus mattis. Etiam placerat ipsum sit amet arcu vestibulum ultricies pellentesque urna molestie. Donec tincidunt fringilla mi, non aliquet ipsum porttitor eget. Pellentesque et lobortis nisi. Nam lectus lectus, molestie nec facilisis pellentesque, sollicitudin a neque. Etiam sed tristique eros. Sed ac sagittis urna. Etiam elementum lectus sit amet enim aliquam sit amet egestas purus tristique. Aliquam lobortis posuere dolor, vitae lobortis arcu pharetra ut. Mauris gravida cursus turpis, id placerat justo imperdiet quis. Ut fringilla molestie tristique. Vestibulum pellentesque nisl vulputate magna viverra fermentum.</p>

      <p>Integer vulputate orci a massa tristique consequat. Sed vestibulum sapien at justo venenatis lacinia. Quisque ut massa mi. Quisque pellentesque tincidunt dolor a molestie. Suspendisse non arcu aliquam enim vehicula euismod et ac neque. Vestibulum quis massa mi, ac mattis turpis. Sed egestas nunc eget libero porta sed bibendum diam tristique. Maecenas orci quam, adipiscing id ornare dictum, fermentum ac tellus. Quisque luctus purus nec est tristique dapibus. Praesent posuere nunc vitae nisl accumsan accumsan. Pellentesque nunc quam, blandit et convallis ac, gravida sit amet augue. Duis ultricies, libero in pharetra lacinia, mi quam porta orci, aliquam hendrerit elit mauris eu ipsum. Suspendisse eget tellus vel orci lobortis pretium eget non justo.</p>

      <p>Mauris interdum tortor et sapien aliquet hendrerit. Donec vitae porttitor ligula. Nulla convallis, nibh at elementum volutpat, quam ante consequat elit, vel adipiscing libero augue id nisi. Quisque mollis neque ut leo consequat vel egestas arcu vehicula. Pellentesque in mi vel arcu volutpat gravida. Suspendisse sit amet fringilla quam. Proin ut est non nunc molestie scelerisque sed at nisl. Nullam pellentesque erat sed neque cursus blandit. In ullamcorper sem sed turpis tempor consectetur.</p>

      <p>Quisque quis turpis sapien. Morbi tincidunt porta arcu vitae posuere. Duis pretium dictum vulputate. Nam quis elit tortor. Vestibulum in mi a ipsum blandit fermentum eget ac neque. Maecenas est nisi, imperdiet eget rutrum vitae, suscipit vel dolor. Nunc commodo placerat nunc sed varius.</p>

      <p>Fusce tempus rutrum enim, a gravida nulla porta vehicula. Maecenas id purus a diam iaculis egestas. In vestibulum, felis a iaculis sollicitudin, purus nisi faucibus metus, interdum adipiscing nisi purus placerat nibh. Phasellus eget augue quis purus gravida ornare in nec tortor. Curabitur pulvinar imperdiet erat eu accumsan. Cras volutpat dolor vel erat placerat dignissim. Nulla facilisi.</p>

      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae velit sit amet velit rhoncus mattis. Etiam placerat ipsum sit amet arcu vestibulum ultricies pellentesque urna molestie. Donec tincidunt fringilla mi, non aliquet ipsum porttitor eget. Pellentesque et lobortis nisi. Nam lectus lectus, molestie nec facilisis pellentesque, sollicitudin a neque. Etiam sed tristique eros. Sed ac sagittis urna. Etiam elementum lectus sit amet enim aliquam sit amet egestas purus tristique. Aliquam lobortis posuere dolor, vitae lobortis arcu pharetra ut. Mauris gravida cursus turpis, id placerat justo imperdiet quis. Ut fringilla molestie tristique. Vestibulum pellentesque nisl vulputate magna viverra fermentum.</p>

      <p>Integer vulputate orci a massa tristique consequat. Sed vestibulum sapien at justo venenatis lacinia. Quisque ut massa mi. Quisque pellentesque tincidunt dolor a molestie. Suspendisse non arcu aliquam enim vehicula euismod et ac neque. Vestibulum quis massa mi, ac mattis turpis. Sed egestas nunc eget libero porta sed bibendum diam tristique. Maecenas orci quam, adipiscing id ornare dictum, fermentum ac tellus. Quisque luctus purus nec est tristique dapibus. Praesent posuere nunc vitae nisl accumsan accumsan. Pellentesque nunc quam, blandit et convallis ac, gravida sit amet augue. Duis ultricies, libero in pharetra lacinia, mi quam porta orci, aliquam hendrerit elit mauris eu ipsum. Suspendisse eget tellus vel orci lobortis pretium eget non justo.</p>

      <p>Mauris interdum tortor et sapien aliquet hendrerit. Donec vitae porttitor ligula. Nulla convallis, nibh at elementum volutpat, quam ante consequat elit, vel adipiscing libero augue id nisi. Quisque mollis neque ut leo consequat vel egestas arcu vehicula. Pellentesque in mi vel arcu volutpat gravida. Suspendisse sit amet fringilla quam. Proin ut est non nunc molestie scelerisque sed at nisl. Nullam pellentesque erat sed neque cursus blandit. In ullamcorper sem sed turpis tempor consectetur.</p>

      <p>Quisque quis turpis sapien. Morbi tincidunt porta arcu vitae posuere. Duis pretium dictum vulputate. Nam quis elit tortor. Vestibulum in mi a ipsum blandit fermentum eget ac neque. Maecenas est nisi, imperdiet eget rutrum vitae, suscipit vel dolor. Nunc commodo placerat nunc sed varius.</p>

      <p>Fusce tempus rutrum enim, a gravida nulla porta vehicula. Maecenas id purus a diam iaculis egestas. In vestibulum, felis a iaculis sollicitudin, purus nisi faucibus metus, interdum adipiscing nisi purus placerat nibh. Phasellus eget augue quis purus gravida ornare in nec tortor. Curabitur pulvinar imperdiet erat eu accumsan. Cras volutpat dolor vel erat placerat dignissim. Nulla facilisi.</p>

      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae velit sit amet velit rhoncus mattis. Etiam placerat ipsum sit amet arcu vestibulum ultricies pellentesque urna molestie. Donec tincidunt fringilla mi, non aliquet ipsum porttitor eget. Pellentesque et lobortis nisi. Nam lectus lectus, molestie nec facilisis pellentesque, sollicitudin a neque. Etiam sed tristique eros. Sed ac sagittis urna. Etiam elementum lectus sit amet enim aliquam sit amet egestas purus tristique. Aliquam lobortis posuere dolor, vitae lobortis arcu pharetra ut. Mauris gravida cursus turpis, id placerat justo imperdiet quis. Ut fringilla molestie tristique. Vestibulum pellentesque nisl vulputate magna viverra fermentum.</p>

      <p>Integer vulputate orci a massa tristique consequat. Sed vestibulum sapien at justo venenatis lacinia. Quisque ut massa mi. Quisque pellentesque tincidunt dolor a molestie. Suspendisse non arcu aliquam enim vehicula euismod et ac neque. Vestibulum quis massa mi, ac mattis turpis. Sed egestas nunc eget libero porta sed bibendum diam tristique. Maecenas orci quam, adipiscing id ornare dictum, fermentum ac tellus. Quisque luctus purus nec est tristique dapibus. Praesent posuere nunc vitae nisl accumsan accumsan. Pellentesque nunc quam, blandit et convallis ac, gravida sit amet augue. Duis ultricies, libero in pharetra lacinia, mi quam porta orci, aliquam hendrerit elit mauris eu ipsum. Suspendisse eget tellus vel orci lobortis pretium eget non justo.</p>

      <p>Mauris interdum tortor et sapien aliquet hendrerit. Donec vitae porttitor ligula. Nulla convallis, nibh at elementum volutpat, quam ante consequat elit, vel adipiscing libero augue id nisi. Quisque mollis neque ut leo consequat vel egestas arcu vehicula. Pellentesque in mi vel arcu volutpat gravida. Suspendisse sit amet fringilla quam. Proin ut est non nunc molestie scelerisque sed at nisl. Nullam pellentesque erat sed neque cursus blandit. In ullamcorper sem sed turpis tempor consectetur.</p>

      <p>Quisque quis turpis sapien. Morbi tincidunt porta arcu vitae posuere. Duis pretium dictum vulputate. Nam quis elit tortor. Vestibulum in mi a ipsum blandit fermentum eget ac neque. Maecenas est nisi, imperdiet eget rutrum vitae, suscipit vel dolor. Nunc commodo placerat nunc sed varius.</p>

      <p>Fusce tempus rutrum enim, a gravida nulla porta vehicula. Maecenas id purus a diam iaculis egestas. In vestibulum, felis a iaculis sollicitudin, purus nisi faucibus metus, interdum adipiscing nisi purus placerat nibh. Phasellus eget augue quis purus gravida ornare in nec tortor. Curabitur pulvinar imperdiet erat eu accumsan. Cras volutpat dolor vel erat placerat dignissim. Nulla facilisi.</p>
    </div>
  </body>
</html>
```

```css
* {
  margin: 0;
  padding: 0;
}
#page {
  width: 400px;
  margin: 60px 20px;
}
p {
  margin: 20px 0;
}
button {
  padding: 2px 10px;
  margin-right: 10px;
}
.enabled {
  color: green;
}
.disabled {
  color: red;
}
#menu {
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px 20px;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #ccc;
  background: #f5f5f5;
  opacity: 0.95;
}
```

```javascript
document.getElementById("enable").onclick = function () {
  enableScroll();
  document.getElementById("status").innerHTML = "enabled";
  document.getElementById("status").className = "enabled";
};

document.getElementById("disable").onclick = function () {
  disableScroll();
  document.getElementById("status").innerHTML = "disabled";
  document.getElementById("status").className = "disabled";
};
```
