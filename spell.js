/*\
|*|
|*|			:: spell.js ::
|*|
|*|
|*|	A simple "keypress" event handler that silently listens to what is typed outside of form fields
|*|
|*|	https://github.com/madmurphy/spell.js/
|*|
|*|	Version 1.0.0
|*|
|*|	(c) 2017 madmurphy
|*|
|*|	This CSS is released under the GNU Public License, version 3 or later.
|*|	http://www.gnu.org/licenses/gpl-3.0.html
|*|
|*|
\*/


/*


	Summary
	=======


	Constructor's syntax:

		`new Spell([content[, callback[, reticent[, disabled]]]])`


	`Spell` object methods:

	- `Spell.getStatus()`
	- `Spell.setStatus()`
	- `Spell.pronounce()`
	- `Spell.unspellAll()`
	- `Spell.makeSilence()`
	- `Spell.activeList()`


	`Spell` instances methods:

	- `Spell.prototype.enable()`
	- `Spell.prototype.disable()`
	- `Spell.prototype.unspell()`


	`Spell` instances properties:

	- `spell.content`
	- `spell.ontype`
	- `spell.reticent`
	- `spell.noticeable`
	- `spell.INDEX` (opaque / read-only)


	DOM classes are defined in:

	- `sListenClass` (private)
	- `sForbidClass` (private)



	IE Support
	==========

	- `window.addEventListener()` requires IE > 9
	- `Object.create()` requires IE > 9
	- `Element.prototype.classList` requires IE 10
	- `Array.prototype.indexOf()` requires IE > 9

	If you provide polyfills the code should be compatible with IE > 6 (not tested, let me know!). Possible clues:

	- https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Compatibility
	- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill
	- https://github.com/eligrey/classList.js/
	- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill

*/


"use strict";


/**

	@class		Spell
	@brief		A class of typing listeners.
	@param		sTxt		The string that triggers the `spell` (optional)
	@param		fOnType		The function that will be invoked when the `spell` is triggered (optional)
	@param		bReticent	A boolean expressing whether the `spell` is active only on elements
					that possess a class matching the string `sListenClass` (optional)
	@param		bDisabled	A boolean expressing whether the `spell` must be created active or not
					(optional)
	@return		The `spell` created

	The parameters @p sTxt, @p fOnType and  @p bReticent can be assigned later by manually setting the properties
	`spell.content`, `spell.ontype` and `spell.reticent` on the instance object.

	The parameter @p bDisabled can be changed later by invoking the methods `spell.enable()`
	and `spell.disable()`.

**/
function Spell (sTxt, fOnType, bReticent, bDisabled) {

	if (!(this && this instanceof Spell)) {

		return new Spell(sTxt || null, fOnType || null, Boolean(bReticent), Boolean(bDisabled));

	}

	if (sTxt) {

		this.content = sTxt;

	}

	if (fOnType) {

		this.ontype = fOnType;

	}

	if (bReticent) {

		this.reticent = true;

	}

	bDisabled || this.enable();

}


/**

	@brief		`Spell.prototype` object

	Note: The original prototype will be preserved as prototype of the new prototype

**/
Spell.prototype = (function () {


	/* Private namespace */


	/**

		@brief		A `"keypress"` event listener (private, event-invoked)
		@param		oKEvt		The `"keypress"` event
		@return		Nothing

		A `"keypress"` event sent by form fields or `contentEditable` elements will be ignored, unless the
		latters possess a class that matches the string `sListenClass`.

	**/
	function spellOnKeypress (oKEvt) {

		var

			/* var */ oThis, nRank, bPrevent = false, /* const */ oEvent = oKEvt || /* IE */ window.event,
			nChr = oEvent.charCode, sNodeType = oEvent.target.nodeName.toUpperCase(),
			bEditable = oEvent.target.isContentEditable || /^(?:TEXTAREA|INPUT|SELECT|BUTTON)$/.test(sNodeType);

		/*

			`nRank` possible values:

			`0` -> `oEvent.target` doesn't possess/inherit any special class
			`1` -> `oEvent.target` possesses/inherits the `"enchanted"` class
			`2` -> `oEvent.target` possesses/inherits the `"cursed"` class

			The higher the value, the higher its priority. Direct assignment prevails over inheritance.
	
		*/

		for (oThis = oEvent.target, nRank = 0; nRank === 0 && oThis && oThis.classList; oThis = oThis.parentNode) {

			nRank	=	oThis.classList.contains(sForbidClass) ? 2
					: oThis.classList.contains(sListenClass) ? 1
					: 0;


		}

		if (bEditable && !oEvent.target.classList.contains(sListenClass) || nChr === 0 || nRank === 2) {

			return true;

		}

		for (var /* let */ nStartPos, nIdx = 0; nIdx < aActive.length; nIdx++) {

			oThis = aActive[nIdx];

			if (typeof oThis.content !== "string" || oThis.reticent && nRank !== 1) {

				continue;

			}

			nStartPos = isFinite(oThis.INDEX) && oThis.INDEX >= 0 ? Math.floor(oThis.INDEX) : 0;

			oThis.INDEX		=	nChr === oThis.content.charCodeAt(nStartPos) ?
								nStartPos + 1
							: nChr === oThis.content.charCodeAt(0) ?
								1
							:
								0;

			bPrevent = bPrevent || oThis.noticeable && oThis.INDEX > (bEditable && nStartPos === 1 ? 1 : 0);

			if (oThis.INDEX === oThis.content.length) {

				typeof oThis.ontype === "function" && oThis.ontype(oEvent.target);
				oThis.INDEX = 0;

			}

		}

		bPrevent && (
			oKEvt.preventDefault ?
				oKEvt.preventDefault()
			: /* IE */
				(oKEvt.returnValue = false)
		);

		/*

		In the case of `window.onkeypress = spellOnKeypress` instead of
		`window.addEventListener("keypress", spellOnKeypress, false)`...:

		*/

		/*

		return !bPrevent;

		*/

	}


	var
		/* const */ sListenClass = "enchanted", sForbidClass = "cursed", oDefaults = Spell.prototype,
		oProto = Object.create(oDefaults), aActive = [],
		/* var */ bUnlocked = true;


	/* Export to global namespace */


	/* Default values */


	/** @brief	The string that triggers the event **/
	oDefaults.content = null;

	/** @brief	The function that will be invoked when `spell` is completed **/
	oDefaults.ontype = null;

	/** @brief	The `spell` is active only on elements possessing a class that matches the string `sListenClass` **/
	oDefaults.reticent = false;

	/** @brief	If `true`, prevents `"keypress"` event's default actions whenever a typed character matches the `spell`'s `content` **/
	oDefaults.noticeable = true;

	/** @brief	The number of correct characters consecutively typed in respect to the `content` property (opaque) **/
	oDefaults.INDEX = 0;


	/* `Spell` object methods */


	/**

		@brief		Gets the listening status
		@return		The value of the private variable `bUnlocked`

		Private variables used: `bUnlocked`

	**/
	Spell.getStatus = function () {

		return bUnlocked;

	};


	/**

		@brief		Adds or removes the `spellOnKeypress` event handler to the `window` object
		@param		bListen		The boolean expressing whether the event handler must be added
						(`true`) or removed (`false`)
		@return		Nothing

		Private variables used: `bUnlocked`

	**/
	Spell.setStatus = function (bListen) {

		if (arguments.length === 0 || Boolean(bListen) === bUnlocked) {

			return false;

		}

		window[bListen ? "addEventListener" : "removeEventListener"]("keypress", spellOnKeypress, false);
		bUnlocked = !bUnlocked;

		return true;


	};


	/* Alternatively... */

	/*

	Object.defineProperty(Spell, "listening", {
		get: Spell.getStatus,
		set: Spell.setStatus,
		enumerable: true,
		configurable: false
	});

	delete Spell.getStatus;
	delete Spell.setStatus;

	*/


	/**

		@brief		Checks whether a string matches an active key; if it does, the typing event will be
				triggered
		@param		sTxt		The string to check
		@param		oElement	The element to be passed to the function referenced by `spell.ontype`
						(optional)
		@return		Nothing

		If the argument @p oElement is not expressed the `window` object will be passed instead.

		Private variables used: `aActive`

	**/
	Spell.pronounce = function (sTxt, oElement) {

		for (var /* let */ nIdx = 0; nIdx < aActive.length; nIdx++) {

			typeof aActive[nIdx].ontype === "function" && sTxt === aActive[nIdx].content && aActive[nIdx].ontype(oElement || window);

		}

	};


	/**

		@brief		Resets the status of all `spell`s currently active
		@return		Nothing

		Private variables used: `aActive`

	**/
	Spell.unspellAll = function () {

		for (var /* let */ nIdx = 0; nIdx < aActive.length; aActive[nIdx++].INDEX = 0);

	};


	/**

		@brief		Disables all `spell`s currently active
		@return		Nothing

		Private variables used: `aActive`, `bUnlocked`

	**/
	Spell.makeSilence = function () {

		Spell.unspellAll();
		aActive.length = 0;
		bUnlocked && window.removeEventListener("keypress", spellOnKeypress, false);

	};


	/**

		@brief		Gets the list of all `spell`s currently active
		@return		A new array containing all `spell`s currently active

		Private variables used: `aActive`

	**/
	Spell.activeList = function () {

		return aActive.slice();

	};


	/* `Spell` instances methods */


	/**

		@brief		Enables a `spell`
		@return		`false` if the `spell` had been already enabled, `true` otherwise

		Private variables used: `aActive`, `bUnlocked`

	**/
	oProto.enable = function () {

		var /* const */ bIsNew = aActive.indexOf(this) === -1;

		bUnlocked && aActive.length === 0 && window.addEventListener("keypress", spellOnKeypress, false);
		bIsNew && aActive.push(this);

		return bIsNew;

	};


	/**

		@brief		Disables a `spell`
		@return		`false` if the `spell` had been already disabled, `true` otherwise

		Private variables used: `aActive`, `bUnlocked`

	**/
	oProto.disable = function () {

		var /* const */ nKeyIdx = aActive.indexOf(this);

		nKeyIdx > -1 && aActive.splice(nKeyIdx, 1);
		this.INDEX = 0;
		bUnlocked && aActive.length === 0 && window.removeEventListener("keypress", spellOnKeypress, false);;

		return nKeyIdx > -1;

	};


	return oProto;


})();


/**

	@brief		Resets the status of a `spell` by setting its `INDEX` property to `0`
	@return		Nothing

**/
oProto.unspell = function () {

	this.INDEX = 0;

};

/* END */

