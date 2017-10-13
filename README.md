spell.js
========

A simple `"keypress"` event handler that silently listens to what is typed outside of form fields


Introduction
------------

**spell.js** is a simple library that handles the capture of custom words typed in any point of the page. The library does not keep track of what users type, but only triggers events after a user has typed specific keywords. Its purpose is not spy users' actions or to use JavaScript to handle passwords or encrypted contents, but rather to enable _custom commands that should not be publicly advertised_.

For instance, imagine you have a website, and this possesses an administration panel protected by a password. On the one hand you might want to be able to access the panel easily, so a link to it in your home page would be helpful. On the other hand you might not want that the world sees a link to something no one can access except you. The solution would be therefore to _hide the link somehow_.

With this library you could easily solve this situation by generating, for example, a redirect to the administration panel when you type the words &ldquo;it's me&rdquo; anywhere on the page. In this way an attacker will still be able to see the location of the administration page by looking at the code &ndash; but that page is protected by a password (server-side), and for most platforms the location of the administration page is anyway known (think of Wordpress, for example). However you will have reached your goal of _not advertising_ the location of the administration panel and still be able to reach it easily.


### Sample usage

```html
<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script type="text/javascript" src="spell.js"></script>
<title>spell.js &ndash; Example</title>
<script type="text/javascript">
var mySpell = new Spell(/* place here your keyword...: */ "silence", function (element) {

    alert("You have typed the word \"" + this.content + "\"!");

});
</script>
</head>

<body>
<p>Type the word &ldquo;silence&rdquo; in any point of the page...</p>
</body>
</html>
```


### Methods and properties overview


#### The constructor

* `new Spell()`


#### `Spell` object methods

* `Spell.getStatus()`
* `Spell.setStatus()`
* `Spell.pronounce()`
* `Spell.unspellAll()`
* `Spell.makeSilence()`
* `Spell.activeList()`


#### `Spell` instances methods

* `Spell.prototype.enable()`
* `Spell.prototype.disable()`
* `Spell.prototype.unspell()`


#### `Spell` instances properties

* `spell.content`
* `spell.ontype`
* `spell.reticent`
* `spell.noticeable`
* `spell.INDEX` (opaque / read-only)


### DOM overview


#### Optional classes

* `"enchanted"`
* `"cursed"`


The constructor
---------------


### `new Spell()`

The `Spell` constructor creates a `"keypress"` event listener (attached to the `window` object) able to capture the typing of a custom word/sentence in any point of the page and trigger an event.


#### Syntax

```javascript
new Spell([content[, callback[, reticent[, disabled]]]])
```


#### Parameters

* **content** _(optional)_: The string that triggers the event (default value: `null`)
* **callback** _(optional)_: The function that will be invoked when the `spell` is triggered (default value: `null`)
* **reticent** _(optional)_: A boolean expressing whether the `spell` is active _only_ on elements that possess the `"enchanted"` class &ndash; see below (default value: `false`)
* **disabled** _(optional)_: A boolean expressing whether the `spell` is active or not (default value: `false`)


#### Return

The `spell` object created.


#### Notes

The parameters `content`, `callback` and `reticent` can be assigned later by manually setting the properties `spell.content`, `spell.ontype` and `spell.reticent` on the instance object (see below).

The parameter `disabled` can be modified later by invoking the instance's methods `spell.disable()` and `spell.enable()` (see below).

If the parameter `reticent` is set to `false` or omitted, the handler will listen to what the user types anywhere except in form fields and editable contents. In order to enable the listening in form fields and editable contents it is necessary to assign the class `"enchanted"` to them (see below).

This function should be invoked with the `new` operator.


`Spell` object methods
----------------------


### `Spell.getStatus()`

Gets the status of the global `Spell` object.


#### Syntax

```javascript
Spell.getStatus()
```


#### Parameters

No parameters are required.


#### Return

This method returns `true` if the global `Spell` object is currently listening, `false` otherwise.


### `Spell.setStatus()`

Sets the status of the global `Spell` object.


#### Syntax

```javascript
Spell.setStatus(active)
```


#### Parameters

* **active**: A boolean expressing whether the global `Spell` object must be set on listening mode or not


#### Return

This method returns `false` if the `spell` was already in the same listening status expressed by the `active` parameter, `true` otherwise.


### `Spell.pronounce()`

This method checks whether a string matches one or more active keys. If it does, the typing event(s) will be triggered.


#### Syntax

```javascript
Spell.pronounce(content[, element])
```


#### Parameters

* **content**: The string to check
* **element** _(optional)_: The element to be passed to the function referenced by `spell.ontype` (default value: `window`)


#### Return

This method does not return anything.


#### Notes

Many devices, such as mobiles and tablets, do not possess a physical keyboard, but rather a virtual one. Normally the latter is not available outside of editable contents, hence in some cases it might be impossible for the user to be able to type _anything at all_ in the page. To ensure the capability to silently type a word it might be necessary therefore, in some cases, to explore other ways.

The `Spell.pronounce()` method allows to test a keyword _via code_, rather than via user input. By doing so it allows to build alternative ways to make certain that the user is able to type a keyword _at least somewhere_. See, for instance, the following example.

```html
<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script type="text/javascript" src="spell.js"></script>
<title>Spell.pronounce()</title>
</head>

<body>

<p>Type &ldquo;foo&rdquo; or &ldquo;bar&rdquo; in any point of the page...</p>
<p><strong>Note:</strong> If you use a virtual keyboard, <span id="five_times" style="cursor: default; text-decoration: underline; color: #0000ff;">click here <strong>five</strong> times</span> then type either &ldquo;foo&rdquo; or &ldquo;bar&rdquo;.</p>

<script type="text/javascript">
(function () {

    function onKeywordMatches (oElement) {

        alert("You have typed the word \"" + this.content + "\"!");

    }

    var
        clickCounter = 0, myClickable = document.getElementById("five_times"),
        mySpell1 = new Spell("foo", onKeywordMatches),
        mySpell2 = new Spell("bar", onKeywordMatches);

    document.addEventListener("click", function (oEvent) {

        var bWrongPoint = true;

        for (var oIter = oEvent.target; bWrongPoint && oIter; bWrongPoint = oIter !== myClickable, oIter = oIter.parentNode);

        if (bWrongPoint) {

            clickCounter = 0;

        } else if (clickCounter < 4) {

            clickCounter++;
            oEvent.preventDefault();

        } else {

            clickCounter = 0;
            Spell.pronounce(prompt("Tell me something..."), this);
            oEvent.preventDefault();

        }

    }, false);

})();
</script>

</body>
</html>
```


### `Spell.unspellAll()`

This method resets the status of a all `spell`s currently active.


#### Syntax

```javascript
Spell.unspellAll()
```


#### Parameters

No parameters are required.


#### Return

This method does not return anything.


### `Spell.makeSilence()`

This method disables all `spell`s currently active.


#### Syntax

```javascript
Spell.makeSilence()
```


#### Parameters

No parameters are required.


#### Return

This method does not return anything.


### `Spell.activeList()`

This method gets the list of all `spell`s currently active.


#### Syntax

```javascript
Spell.activeList()
```


#### Parameters

No parameters are required.


#### Return

This method returns a new array containing all `spell`s currently active.


`Spell` instances methods
-------------------------


### `Spell.prototype.enable()`

This method enables a `spell`.


#### Syntax

```javascript
spell.enable()
```


#### Parameters

No parameters are required.


#### Return

This method returns `false` if the `spell` had been already enabled, `true` otherwise.


### `Spell.prototype.disable()`

This method disables a `spell`.


#### Syntax

```javascript
spell.disable()
```


#### Parameters

No parameters are required.


#### Return

This method returns `false` if the `spell` had been already enabled, `true` otherwise.


### `Spell.prototype.unspell()`

This method resets the status of a `spell`.


#### Syntax

```javascript
spell.unspell()
```


#### Parameters

No parameters are required.


#### Return

This method does not return anything.


`Spell` instances properties
----------------------------


### `spell.content`

This property defines the keyword that triggers the event.


#### Syntax

```javascript
console.log(spell.content);

spell.content = "hello world";
spell.unspell();
```


#### Notes

The `content` property of a `spell` can be edited after the `spell` has been already created. In this case, however, it might be wished to reset the status of the latter by invoking the method `spell.unspell()` as well, as in the example above, or the new keyword will take advantage of the positive status of the previous keyword if some correct characters had been already typed.


### `spell.ontype`

This property contains a reference to the function that will be invoked when the typing event is triggered. The `element` on which the final `"keypress"` event has occurred will be passed as only argument, while the `this` object will be the `spell` itself. The function's return value will be ignored.


#### Syntax

```javascript
spell.ontype = function (element) {

    /* [...] */

};
```


### `spell.reticent`

If set to `true`, the `spell` will be active only on elements that possess the `"enchanted"` class (see below). Further screenings on the target elements can be performed using the `element` parameter passed to the callback function (see `spell.ontype`).


#### Syntax

```javascript
spell.reticent = true;
spell.reticent = false;
```


#### Notes

For further readings, see below (&sect; DOM).


### `spell.noticeable`

If set to `true`, `spell.noticeable` prevents `"keypress"` event's default actions whenever a typed character matches a `spell`'s `content` property. Its default value is `true`.


#### Syntax

```javascript
spell.noticeable = false;
spell.noticeable = true;
```


#### Notes

It is possible to see the effect of this property by assigning the `"enchanted"` class to a text input and trying to type something inside it, first with `spell.noticeable` set to `true`, then to `false`.


### `spell.INDEX` (opaque / read-only)

A value expressing the number of correct characters consecutively typed in respect to the `content` property. The initial value is `0`.


#### Syntax

This property is for internal purposes and should be considered opaque / read-only. To reset its value to `0` use the `spell.unspell()` method (see above).


DOM
---


### The `"enchanted"` class

An element whose `classList` contains the `"enchanted"` token will be ensured to be a listener of typing events unless its `classList` contains the `"cursed"` token as well (see below).


#### Syntax

```html
<p><input type="text" class="enchanted" /></p>
<div contenteditable class="enchanted" style="height: 200px; width: 300px; border: 1px #000000 solid;"></div>
```


#### Notes

The `spell`s whose `reticent` property is set to `false` will have every element of the page as listeners except the following ones:

* `HTMLInputElement`
* `HTMLSelectElement`
* `HTMLTextAreaElement`
* `HTMLButtonElement`
* Any `HTMLElement` whose `isContentEditable` property equals `true`

From this it follows that the `"enchanted"` class is mandatory for the elements listed above in order to be considered listeners.

As for the `spell`s whose `reticent` property is set to `true` instead, _no HTML element_ will be considered listener unless it or its parent(s) possess the `"enchanted"` class.

Note that the behavior determined by this class will be inherited by the child nodes (except when they are form fields and editable contents) &ndash; unless reverted by a `"cursed"` class in the child.

This class is defined by the private variable `sListenClass` in the code.


### The `"cursed"` class

An element whose `classList` contains the `"cursed"` token will never be allowed to be a listener of typing events.


#### Syntax

```html
<div class="cursed" tabindex="15">Hello world</div>
<p><a href="http://www.example.com/" class="cursed">www.example.com</a></p>
```


#### Notes

This class will work only on elements that can receive `focus()`. It is important to point out that, despite the `focus()` method is defined on the `HTMLElement` super-class, the only elements that can actually receive focus are:

* `HTMLAnchorElement`/`HTMLAreaElement` with an `href` attribute
* `HTMLInputElement`/`HTMLSelectElement`/`HTMLTextAreaElement`/`HTMLButtonElement` without the `disabled` attribute
* `HTMLIFrameElement`
* Any element with a `tabindex` attribute > `-1`

If, for example, the `<body>` element is listening to the typing events and a `"cursed"` class has been assigned to its `<p>` child, it will not be possible to prevent that the typing event will be captured even if the user has clicked on the `<p>` element. This is so because a `<p>` element cannot receive `focus()`, and therefore can never appear as the actual listener of the event (but instead `<body>` will).

In order for the `<p>` element to receive `focus()` and be an actual listener of typing events this must possess a `tabindex` attribute > `-1`. In this case it can make sense to assign the `"cursed"` class to it to prevent its capturing of the typing.

Note that the behavior determined by this class will be inherited by the child nodes &ndash; unless reverted by a `"enchanted"` class in the child.

This class is defined by the private variable `sForbidClass` in the code.


Code considerations
-------------------

The `content` property of a `spell` may contain any characters and symbols, but consider that special characters might not be present in some keyboards. The comparison with what the user types is always case-sensitive. Control keys are not captured.

The `"cursed"` class has a higher priority in respect to the `"enchanted"` class, and for elements possessing both classes only the former will be considered. Direct assignment however always prevails over inheritance, and a close inheritance prevails over a far one.


Examples
--------


### Do it only once

```javascript
var mySpell = new Spell("myword", function (element) {

    this.disable();

    /* DO SOMETHING */

});
```

### Visualize the listening elements

Imagine you want to highlight via CSS the parts of the page that will listen to the typing events. As for the `spell.reticent === false` cases, the CSS selector will correspond to:

```css
:not(.enchanted):not(.cursed):not(textarea):not(input):not(select):not(button):not([contenteditable=""]):not([contenteditable="true"]):not([contenteditable="TRUE"]),
.enchanted:not(.cursed) {
    background-color: yellow !important;
}
```

As for the `spell.reticent === true` cases, the CSS selector will correspond to:

```css
.enchanted:not(.cursed) {
    background-color: yellow !important;
}
```
