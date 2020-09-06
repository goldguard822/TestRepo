/* 광고 보기 버튼 S */
document.writeln('<div role="banner_wrap" style="position:fixed; left:0px; bottom:50px; width:100%; height:40px; background-color:transparent; z-index:99; touch-action:none;">');
document.writeln('  <span role="banner_area" class="banner_area_top" style="float:left; display:inline-block; width:100%; height:20px; background-color:transparent; touch-action:none;"></span>');
document.writeln('  <span role="banner_area" class="banner_area_bottom" style="float:left; display:inline-block; width:100%; height:20px; background: rgba(0,0,0,0.4) url(./images/btnO_arrow_up.gif) no-repeat center center; background-size: 20px 20px; touch-action:none;"></span>');
document.writeln('</div>');
/* 광고 보기 버튼 E */

/* 실제 광고 노출 영역 S */
document.writeln('<div role="ad_area" style="position: fixed; top: 100%; right: 0; left: 0; bottom: 50px; background-color:rgba(0,0,0,0.4); z-index:99; touch-action:none; overflow:hidden; display:none;">');
document.writeln('  <span role="slide_close" style="float:left; display:inline-block; width:100%; height:20px; background: rgba(0,0,0,0.4) url(./images/btnO_arrow_up.gif) no-repeat center center; background-size: 20px 20px;"></span>');
document.writeln('  <span role="slide_close" style="float:left; display:inline-block; width:100%; height:20px; background-color:transparent; touch-action:none;"></span>');
document.writeln('  <div style="position: absolute; top: calc(50% + 20px); left: 50%; transform: translate(-50%, calc(-50% + 20px));">');
document.writeln('    <scri'+'pt type="text/javascript" src="//tm.interworksmedia.co.kr/ads.js/9D2DCDA5"></scri'+'pt>"'); // 이 부분에 광고 스크립트 들어가야 함
document.writeln('  </div>');
document.writeln('</div>');
/* 실제 광고 노출 영역 E */

(function (factory) {
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function ($) {
	"use strict";

	//Constants
	var LEFT = "left",
		RIGHT = "right",
		UP = "up",
		DOWN = "down",
		IN = "in",
		OUT = "out",

		NONE = "none",
		AUTO = "auto",

		SWIPE = "swipe",
		PINCH = "pinch",
		TAP = "tap",
		DOUBLE_TAP = "doubletap",
		LONG_TAP = "longtap",

		HORIZONTAL = "horizontal",
		VERTICAL = "vertical",

		ALL_FINGERS = "all",

		DOUBLE_TAP_THRESHOLD = 10,

		PHASE_START = "start",
		PHASE_MOVE = "move",
		PHASE_END = "end",
		PHASE_CANCEL = "cancel",

		SUPPORTS_TOUCH = 'ontouchstart' in window,

		PLUGIN_NS = 'TouchSwipe';

	var defaults = {
		fingers: 1,
		threshold: 75,
		cancelThreshold:null,
		pinchThreshold:20,
		maxTimeThreshold: null,
		fingerReleaseThreshold:250,
		longTapThreshold:500,
		doubleTapThreshold:200,
		swipe: null,
		swipeLeft: null,
		swipeRight: null,
		swipeUp: null,
		swipeDown: null,
		swipeStatus: null,
		pinchIn:null,
		pinchOut:null,
		pinchStatus:null,
		click:null, //Deprecated since 1.6.2
		tap:null,
		doubleTap:null,
		longTap:null,
		triggerOnTouchEnd: true,
		triggerOnTouchLeave:false,
		allowPageScroll: "auto",
		fallbackToMouseEvents: true,
		excludedElements:"label, button, input, select, textarea, a, .noSwipe"
	};

	$.fn.swipe = function (method) {
		var $this = $(this),
			plugin = $this.data(PLUGIN_NS);

		//Check if we are already instantiated and trying to execute a method
		if (plugin && typeof method === 'string') {
			if (plugin[method]) {
				return plugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.swipe');
			}
		}
		//Else not instantiated and trying to pass init object (or nothing)
		else if (!plugin && (typeof method === 'object' || !method)) {
			return init.apply(this, arguments);
		}

		return $this;
	};

	//Expose our defaults so a user could override the plugin defaults
	$.fn.swipe.defaults = defaults;

	$.fn.swipe.phases = {
		PHASE_START: PHASE_START,
		PHASE_MOVE: PHASE_MOVE,
		PHASE_END: PHASE_END,
		PHASE_CANCEL: PHASE_CANCEL
	};

	$.fn.swipe.directions = {
		LEFT: LEFT,
		RIGHT: RIGHT,
		UP: UP,
		DOWN: DOWN,
		IN : IN,
		OUT: OUT
	};

	$.fn.swipe.pageScroll = {
		NONE: NONE,
		HORIZONTAL: HORIZONTAL,
		VERTICAL: VERTICAL,
		AUTO: AUTO
	};

	$.fn.swipe.fingers = {
		ONE: 1,
		TWO: 2,
		THREE: 3,
		ALL: ALL_FINGERS
	};

	function init(options) {
		//Prep and extend the options
		if (options && (options.allowPageScroll === undefined && (options.swipe !== undefined || options.swipeStatus !== undefined))) {
			options.allowPageScroll = NONE;
		}

    //Check for deprecated options
		//Ensure that any old click handlers are assigned to the new tap, unless we have a tap
		if(options.click!==undefined && options.tap===undefined) {
		    options.tap = options.click;
		}

		if (!options) {
			options = {};
		}

    //pass empty object so we dont modify the defaults
		options = $.extend({}, $.fn.swipe.defaults, options);

		//For each element instantiate the plugin
		return this.each(function () {
			var $this = $(this);

			//Check we havent already initialised the plugin
			var plugin = $this.data(PLUGIN_NS);

			if (!plugin) {
				plugin = new TouchSwipe(this, options);
				$this.data(PLUGIN_NS, plugin);
			}
		});
	}

	function TouchSwipe(element, options) {
		var useTouchEvents = (SUPPORTS_TOUCH || !options.fallbackToMouseEvents),
			START_EV = useTouchEvents ? 'touchstart' : 'mousedown',
			MOVE_EV = useTouchEvents ? 'touchmove' : 'mousemove',
			END_EV = useTouchEvents ? 'touchend' : 'mouseup',
			LEAVE_EV = useTouchEvents ? null : 'mouseleave', //we manually detect leave on touch devices, so null event here
			CANCEL_EV = 'touchcancel';

		//touch properties
		var distance = 0,
			direction = null,
			duration = 0,
			startTouchesDistance = 0,
			endTouchesDistance = 0,
			pinchZoom = 1,
			pinchDistance = 0,
			pinchDirection = 0,
			maximumsMap=null;

		//jQuery wrapped element for this instance
		var $element = $(element);

		//Current phase of th touch cycle
		var phase = "start";

		// the current number of fingers being used.
		var fingerCount = 0;

		//track mouse points / delta
		var fingerData=null;

		//track times
		var startTime = 0,
			endTime = 0,
			previousTouchEndTime=0,
			previousTouchFingerCount=0,
			doubleTapStartTime=0;

    //Timeouts
    var singleTapTimeout=null;

		// Add gestures to all swipable areas if supported
		try {
			$element.bind(START_EV, touchStart);
			$element.bind(CANCEL_EV, touchCancel);
		}
		catch (e) {
			$.error('events not supported ' + START_EV + ',' + CANCEL_EV + ' on jQuery.swipe');
		}

		this.enable = function () {
			$element.bind(START_EV, touchStart);
			$element.bind(CANCEL_EV, touchCancel);
			return $element;
		};

		this.disable = function () {
			removeListeners();
			return $element;
		};

		this.destroy = function () {
			removeListeners();
			$element.data(PLUGIN_NS, null);
			return $element;
		};

    this.option = function (property, value) {
        if(options[property]!==undefined) {
            if(value===undefined) {
                return options[property];
            } else {
                options[property] = value;
            }
        } else {
            $.error('Option ' + property + ' does not exist on jQuery.swipe.options');
        }

        return null;
    }

		function touchStart(jqEvent) {
			//If we already in a touch event (a finger already in use) then ignore subsequent ones..
			if( getTouchInProgress() )
				return;

			//Check if this element matches any in the excluded elements selectors,  or its parent is excluded, if so, DON'T swipe
			if( $(jqEvent.target).closest( options.excludedElements, $element ).length>0 )
				return;

			//As we use Jquery bind for events, we need to target the original event object
			//If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
			var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

			var ret,
				evt = SUPPORTS_TOUCH ? event.touches[0] : event;

			phase = PHASE_START;

			//If we support touches, get the finger count
			if (SUPPORTS_TOUCH) {
				// get the total number of fingers touching the screen
				fingerCount = event.touches.length;
			}
			//Else this is the desktop, so stop the browser from dragging the image
			else {
				jqEvent.preventDefault(); //call this on jq event so we are cross browser
			}

			//clear vars..
			distance = 0;
			direction = null;
			pinchDirection=null;
			duration = 0;
			startTouchesDistance=0;
			endTouchesDistance=0;
			pinchZoom = 1;
			pinchDistance = 0;
			fingerData=createAllFingerData();
			maximumsMap=createMaximumsData();
			cancelMultiFingerRelease();


			// check the number of fingers is what we are looking for, or we are capturing pinches
			if (!SUPPORTS_TOUCH || (fingerCount === options.fingers || options.fingers === ALL_FINGERS) || hasPinches()) {
				// get the coordinates of the touch
				createFingerData( 0, evt );
				startTime = getTimeStamp();

				if(fingerCount==2) {
					//Keep track of the initial pinch distance, so we can calculate the diff later
					//Store second finger data as start
					createFingerData( 1, event.touches[1] );
					startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
				}

				if (options.swipeStatus || options.pinchStatus) {
					ret = triggerHandler(event, phase);
				}
			}
			else {
				//A touch with more or less than the fingers we are looking for, so cancel
				ret = false;
			}

			//If we have a return value from the users handler, then return and cancel
			if (ret === false) {
				phase = PHASE_CANCEL;
				triggerHandler(event, phase);
				return ret;
			}
			else {
				setTouchInProgress(true);
			}

      return null;
		};

		function touchMove(jqEvent) {

			//As we use Jquery bind for events, we need to target the original event object
			//If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
			var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

			//If we are ending, cancelling, or within the threshold of 2 fingers being released, don't track anything..
			if (phase === PHASE_END || phase === PHASE_CANCEL || inMultiFingerRelease())
				return;

			var ret,
				evt = SUPPORTS_TOUCH ? event.touches[0] : event;

			//Update the  finger data
			var currentFinger = updateFingerData(evt);
			endTime = getTimeStamp();

			if (SUPPORTS_TOUCH) {
				fingerCount = event.touches.length;
			}

			phase = PHASE_MOVE;

			//If we have 2 fingers get Touches distance as well
			if(fingerCount==2) {

				//Keep track of the initial pinch distance, so we can calculate the diff later
				//We do this here as well as the start event, in case they start with 1 finger, and the press 2 fingers
				if(startTouchesDistance==0) {
					//Create second finger if this is the first time...
					createFingerData( 1, event.touches[1] );

					startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
				} else {
					//Else just update the second finger
					updateFingerData(event.touches[1]);

					endTouchesDistance = calculateTouchesDistance(fingerData[0].end, fingerData[1].end);
					pinchDirection = calculatePinchDirection(fingerData[0].end, fingerData[1].end);
				}

				pinchZoom = calculatePinchZoom(startTouchesDistance, endTouchesDistance);
				pinchDistance = Math.abs(startTouchesDistance - endTouchesDistance);
			}

			if ( (fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH || hasPinches() ) {

				direction = calculateDirection(currentFinger.start, currentFinger.end);

				//Check if we need to prevent default event (page scroll / pinch zoom) or not
				validateDefaultEvent(jqEvent, direction);

				//Distance and duration are all off the main finger
				distance = calculateDistance(currentFinger.start, currentFinger.end);
				duration = calculateDuration();

                //Cache the maximum distance we made in this direction
                setMaxDistance(direction, distance);

				if (options.swipeStatus || options.pinchStatus) {
					ret = triggerHandler(event, phase);
				}

				//If we trigger end events when threshold are met, or trigger events when touch leaves element
				if(!options.triggerOnTouchEnd || options.triggerOnTouchLeave) {

					var inBounds = true;

					//If checking if we leave the element, run the bounds check (we can use touchleave as its not supported on webkit)
					if(options.triggerOnTouchLeave) {
						var bounds = getbounds( this );
						inBounds = isInBounds( currentFinger.end, bounds );
					}

					//Trigger end handles as we swipe if thresholds met or if we have left the element if the user has asked to check these..
					if(!options.triggerOnTouchEnd && inBounds) {
						phase = getNextPhase( PHASE_MOVE );
					}
					//We end if out of bounds here, so set current phase to END, and check if its modified
					else if(options.triggerOnTouchLeave && !inBounds ) {
						phase = getNextPhase( PHASE_END );
					}

					if(phase==PHASE_CANCEL || phase==PHASE_END)	{
						triggerHandler(event, phase);
					}
				}
			}
			else {
				phase = PHASE_CANCEL;
				triggerHandler(event, phase);
			}

			if (ret === false) {
				phase = PHASE_CANCEL;
				triggerHandler(event, phase);
			}
		}

		function touchEnd(jqEvent) {
			//As we use Jquery bind for events, we need to target the original event object
			var event = jqEvent.originalEvent;

			//If we are still in a touch with another finger return
			//This allows us to wait a fraction and see if the other finger comes up, if it does within the threshold, then we treat it as a multi release, not a single release.
			if (SUPPORTS_TOUCH) {
				if(event.touches.length>0) {
					startMultiFingerRelease();
					return true;
				}
			}

			//If a previous finger has been released, check how long ago, if within the threshold, then assume it was a multifinger release.
			//This is used to allow 2 fingers to release fractionally after each other, whilst maintainig the event as containg 2 fingers, not 1
			if(inMultiFingerRelease()) {
				fingerCount=previousTouchFingerCount;
			}

			//call this on jq event so we are cross browser
			jqEvent.preventDefault();

			//Set end of swipe
			endTime = getTimeStamp();

			//Get duration incase move was never fired
			duration = calculateDuration();

			//If we trigger handlers at end of swipe OR, we trigger during, but they didnt trigger and we are still in the move phase
			if(didSwipeBackToCancel()) {
			    phase = PHASE_CANCEL;
                triggerHandler(event, phase);
			} else if (options.triggerOnTouchEnd || (options.triggerOnTouchEnd == false && phase === PHASE_MOVE)) {
				phase = PHASE_END;
                triggerHandler(event, phase);
			}
			//Special cases - A tap should always fire on touch end regardless,
			//So here we manually trigger the tap end handler by itself
			//We dont run trigger handler as it will re-trigger events that may have fired already
			else if (!options.triggerOnTouchEnd && hasTap()) {
                //Trigger the pinch events...
			    phase = PHASE_END;
			    triggerHandlerForGesture(event, phase, TAP);
			}
			else if (phase === PHASE_MOVE) {
				phase = PHASE_CANCEL;
				triggerHandler(event, phase);
			}

			setTouchInProgress(false);

      return null;
		}

		function touchCancel() {
			// reset the variables back to default values
			fingerCount = 0;
			endTime = 0;
			startTime = 0;
			startTouchesDistance=0;
			endTouchesDistance=0;
			pinchZoom=1;

			//If we were in progress of tracking a possible multi touch end, then re set it.
			cancelMultiFingerRelease();

			setTouchInProgress(false);
		}

		function touchLeave(jqEvent) {
			var event = jqEvent.originalEvent;

			//If we have the trigger on leave property set....
			if(options.triggerOnTouchLeave) {
				phase = getNextPhase( PHASE_END );
				triggerHandler(event, phase);
			}
		}

		function removeListeners() {
			$element.unbind(START_EV, touchStart);
			$element.unbind(CANCEL_EV, touchCancel);
			$element.unbind(MOVE_EV, touchMove);
			$element.unbind(END_EV, touchEnd);

			//we only have leave events on desktop, we manually calculate leave on touch as its not supported in webkit
			if(LEAVE_EV) {
				$element.unbind(LEAVE_EV, touchLeave);
			}

			setTouchInProgress(false);
		}

		function getNextPhase(currentPhase) {

			var nextPhase = currentPhase;

			// Ensure we have valid swipe (under time and over distance  and check if we are out of bound...)
			var validTime = validateSwipeTime();
			var validDistance = validateSwipeDistance();
			var didCancel = didSwipeBackToCancel();

			//If we have exceeded our time, then cancel
			if(!validTime || didCancel) {
				nextPhase = PHASE_CANCEL;
			}
			//Else if we are moving, and have reached distance then end
			else if (validDistance && currentPhase == PHASE_MOVE && (!options.triggerOnTouchEnd || options.triggerOnTouchLeave) ) {
				nextPhase = PHASE_END;
			}
			//Else if we have ended by leaving and didn't reach distance, then cancel
			else if (!validDistance && currentPhase==PHASE_END && options.triggerOnTouchLeave) {
				nextPhase = PHASE_CANCEL;
			}

			return nextPhase;
		}

		function triggerHandler(event, phase) {

			var ret = undefined;

			// SWIPE GESTURES
			if(didSwipe() || hasSwipes()) { //hasSwipes as status needs to fire even if swipe is invalid
				//Trigger the swipe events...
				ret = triggerHandlerForGesture(event, phase, SWIPE);
			}

			// PINCH GESTURES (if the above didn't cancel)
			else if((didPinch() || hasPinches()) && ret!==false) {
				//Trigger the pinch events...
				ret = triggerHandlerForGesture(event, phase, PINCH);
			}

			// CLICK / TAP (if the above didn't cancel)
			if(didDoubleTap() && ret!==false) {
				//Trigger the tap events...
				ret = triggerHandlerForGesture(event, phase, DOUBLE_TAP);
			}

			// CLICK / TAP (if the above didn't cancel)
			else if(didLongTap() && ret!==false) {
				//Trigger the tap events...
				ret = triggerHandlerForGesture(event, phase, LONG_TAP);
			}

			// CLICK / TAP (if the above didn't cancel)
			else if(didTap() && ret!==false) {
				//Trigger the tap event..
				ret = triggerHandlerForGesture(event, phase, TAP);
	    	}

			// If we are cancelling the gesture, then manually trigger the reset handler
			if (phase === PHASE_CANCEL) {
				touchCancel(event);
			}

			// If we are ending the gesture, then manually trigger the reset handler IF all fingers are off
			if(phase === PHASE_END) {
				//If we support touch, then check that all fingers are off before we cancel
				if (SUPPORTS_TOUCH) {
					if(event.touches.length==0) {
						touchCancel(event);
					}
				}
				else {
					touchCancel(event);
				}
			}

			return ret;
		}

		function triggerHandlerForGesture(event, phase, gesture) {

			var ret=undefined;

			//SWIPES....
			if(gesture==SWIPE) {
				//Trigger status every time..

				//Trigger the event...
				$element.trigger('swipeStatus', [phase, direction || null, distance || 0, duration || 0, fingerCount]);

				//Fire the callback
				if (options.swipeStatus) {
					ret = options.swipeStatus.call($element, event, phase, direction || null, distance || 0, duration || 0, fingerCount);
					//If the status cancels, then dont run the subsequent event handlers..
					if(ret===false) return false;
				}

				if (phase == PHASE_END && validateSwipe()) {
					//Fire the catch all event
					$element.trigger('swipe', [direction, distance, duration, fingerCount]);

					//Fire catch all callback
					if (options.swipe) {
						ret = options.swipe.call($element, event, direction, distance, duration, fingerCount);
						//If the status cancels, then dont run the subsequent event handlers..
						if(ret===false) return false;
					}

					//trigger direction specific event handlers
					switch (direction) {
						case LEFT:
							//Trigger the event
							$element.trigger('swipeLeft', [direction, distance, duration, fingerCount]);

					        //Fire the callback
							if (options.swipeLeft) {
								ret = options.swipeLeft.call($element, event, direction, distance, duration, fingerCount);
							}
							break;

						case RIGHT:
							//Trigger the event
					        $element.trigger('swipeRight', [direction, distance, duration, fingerCount]);

					        //Fire the callback
							if (options.swipeRight) {
								ret = options.swipeRight.call($element, event, direction, distance, duration, fingerCount);
							}
							break;

						case UP:
							//Trigger the event
					        $element.trigger('swipeUp', [direction, distance, duration, fingerCount]);

					        //Fire the callback
							if (options.swipeUp) {
								ret = options.swipeUp.call($element, event, direction, distance, duration, fingerCount);
							}
							break;

						case DOWN:
							//Trigger the event
					        $element.trigger('swipeDown', [direction, distance, duration, fingerCount]);

					        //Fire the callback
							if (options.swipeDown) {
								ret = options.swipeDown.call($element, event, direction, distance, duration, fingerCount);
							}
							break;
					}
				}
			}

			//PINCHES....
			if(gesture==PINCH) {
				//Trigger the event
			     $element.trigger('pinchStatus', [phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom]);

        //Fire the callback
				if (options.pinchStatus) {
					ret = options.pinchStatus.call($element, event, phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom);
					//If the status cancels, then dont run the subsequent event handlers..
					if(ret===false) return false;
				}

				if(phase==PHASE_END && validatePinch()) {

					switch (pinchDirection) {
						case IN:
							//Trigger the event
              $element.trigger('pinchIn', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom]);

              //Fire the callback
              if (options.pinchIn) {
								ret = options.pinchIn.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom);
							}
							break;

						case OUT:
							//Trigger the event
              $element.trigger('pinchOut', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom]);

              //Fire the callback
              if (options.pinchOut) {
								ret = options.pinchOut.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom);
							}
							break;
					}
				}
			}

			if(gesture==TAP) {
				if(phase === PHASE_CANCEL || phase === PHASE_END) {
          //Cancel any existing double tap
				  clearTimeout(singleTapTimeout);

					//If we are also looking for doubelTaps, wait incase this is one...
				  if(hasDoubleTap() && !inDoubleTap()) {
				        //Cache the time of this tap
                doubleTapStartTime = getTimeStamp();

				        //Now wait for the double tap timeout, and trigger this single tap
				        //if its not cancelled by a double tap
				        singleTapTimeout = setTimeout($.proxy(function() {
        			        doubleTapStartTime=null;
        			        //Trigger the event
                            $element.trigger('tap', [event.target]);


                            //Fire the callback
                            if(options.tap) {
                                ret = options.tap.call($element, event, event.target);
                            }
    			        }, this), options.doubleTapThreshold );

    			    } else {
                        doubleTapStartTime=null;

                        //Trigger the event
                        $element.trigger('tap', [event.target]);


                        //Fire the callback
                        if(options.tap) {
                            ret = options.tap.call($element, event, event.target);
                        }
	    		    }
	    		}
			}

			else if (gesture==DOUBLE_TAP) {
				if(phase === PHASE_CANCEL || phase === PHASE_END) {
					//Cancel any pending singletap
				    clearTimeout(singleTapTimeout);
				    doubleTapStartTime=null;

                    //Trigger the event
                    $element.trigger('doubletap', [event.target]);

                    //Fire the callback
                    if(options.doubleTap) {
                        ret = options.doubleTap.call($element, event, event.target);
                    }
	    		}
			}

			else if (gesture==LONG_TAP) {
				if(phase === PHASE_CANCEL || phase === PHASE_END) {
					//Cancel any pending singletap (shouldnt be one)
				    clearTimeout(singleTapTimeout);
				    doubleTapStartTime=null;

                    //Trigger the event
                    $element.trigger('longtap', [event.target]);

                    //Fire the callback
                    if(options.longTap) {
                        ret = options.longTap.call($element, event, event.target);
                    }
	    		}
			}

			return ret;
		}

		function validateSwipeDistance() {
			var valid = true;
			//If we made it past the min swipe distance..
			if (options.threshold !== null) {
				valid = distance >= options.threshold;
			}

            return valid;
		}

		function didSwipeBackToCancel() {
            var cancelled = false;
    		if(options.cancelThreshold !== null && direction !==null)  {
    		    cancelled =  (getMaxDistance( direction ) - distance) >= options.cancelThreshold;
			}

			return cancelled;
		}

		function validatePinchDistance() {
			if (options.pinchThreshold !== null) {
				return pinchDistance >= options.pinchThreshold;
			}
			return true;
		}

		function validateSwipeTime() {
			var result;
			//If no time set, then return true

			if (options.maxTimeThreshold) {
				if (duration >= options.maxTimeThreshold) {
					result = false;
				} else {
					result = true;
				}
			}
			else {
				result = true;
			}

			return result;
		}

		function validateDefaultEvent(jqEvent, direction) {
			if (options.allowPageScroll === NONE || hasPinches()) {
				jqEvent.preventDefault();
			} else {
				var auto = options.allowPageScroll === AUTO;

				switch (direction) {
					case LEFT:
						if ((options.swipeLeft && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
							jqEvent.preventDefault();
						}
						break;

					case RIGHT:
						if ((options.swipeRight && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
							jqEvent.preventDefault();
						}
						break;

					case UP:
						if ((options.swipeUp && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
							jqEvent.preventDefault();
						}
						break;

					case DOWN:
						if ((options.swipeDown && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
							jqEvent.preventDefault();
						}
						break;
				}
			}

		}

		function validatePinch() {
		    var hasCorrectFingerCount = validateFingers();
		    var hasEndPoint = validateEndPoint();
			var hasCorrectDistance = validatePinchDistance();
			return hasCorrectFingerCount && hasEndPoint && hasCorrectDistance;

		}

		function hasPinches() {
			//Enure we dont return 0 or null for false values
			return !!(options.pinchStatus || options.pinchIn || options.pinchOut);
		}

		function didPinch() {
			//Enure we dont return 0 or null for false values
			return !!(validatePinch() && hasPinches());
		}

		function validateSwipe() {
			//Check validity of swipe
			var hasValidTime = validateSwipeTime();
			var hasValidDistance = validateSwipeDistance();
			var hasCorrectFingerCount = validateFingers();
		    var hasEndPoint = validateEndPoint();
		    var didCancel = didSwipeBackToCancel();

			// if the user swiped more than the minimum length, perform the appropriate action
			// hasValidDistance is null when no distance is set
			var valid =  !didCancel && hasEndPoint && hasCorrectFingerCount && hasValidDistance && hasValidTime;

			return valid;
		}

		function hasSwipes() {
			//Enure we dont return 0 or null for false values
			return !!(options.swipe || options.swipeStatus || options.swipeLeft || options.swipeRight || options.swipeUp || options.swipeDown);
		}

		function didSwipe() {
			//Enure we dont return 0 or null for false values
			return !!(validateSwipe() && hasSwipes());
		}

    function validateFingers() {
      //The number of fingers we want were matched, or on desktop we ignore
    	return ((fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH);
    }

    function validateEndPoint() {
      //We have an end value for the finger
      return fingerData[0].end.x !== 0;
    }

		function hasTap() {
			//Enure we dont return 0 or null for false values
			return !!(options.tap) ;
		}

		function hasDoubleTap() {
			//Enure we dont return 0 or null for false values
			return !!(options.doubleTap) ;
		}

		function hasLongTap() {
			//Enure we dont return 0 or null for false values
			return !!(options.longTap) ;
		}

		function validateDoubleTap() {
		    if(doubleTapStartTime==null){
		        return false;
		    }
		    var now = getTimeStamp();
		    return (hasDoubleTap() && ((now-doubleTapStartTime) <= options.doubleTapThreshold));
		}

		function inDoubleTap() {
		    return validateDoubleTap();
		}

		function validateTap() {
		    return ((fingerCount === 1 || !SUPPORTS_TOUCH) && (isNaN(distance) || distance === 0));
		}

		function validateLongTap() {
		    //slight threshold on moving finger
            return ((duration > options.longTapThreshold) && (distance < DOUBLE_TAP_THRESHOLD));
		}

		function didTap() {
		    //Enure we dont return 0 or null for false values
			return !!(validateTap() && hasTap());
		}

		function didDoubleTap() {
		    //Enure we dont return 0 or null for false values
			return !!(validateDoubleTap() && hasDoubleTap());
		}

		function didLongTap() {
		    //Enure we dont return 0 or null for false values
			return !!(validateLongTap() && hasLongTap());
		}

		function startMultiFingerRelease() {
			previousTouchEndTime = getTimeStamp();
			previousTouchFingerCount = event.touches.length+1;
		}

		function cancelMultiFingerRelease() {
			previousTouchEndTime = 0;
			previousTouchFingerCount = 0;
		}

		function inMultiFingerRelease() {

			var withinThreshold = false;

			if(previousTouchEndTime) {
				var diff = getTimeStamp() - previousTouchEndTime
				if( diff<=options.fingerReleaseThreshold ) {
					withinThreshold = true;
				}
			}

			return withinThreshold;
		}


		function getTouchInProgress() {
			//strict equality to ensure only true and false are returned
			return !!($element.data(PLUGIN_NS+'_intouch') === true);
		}

		function setTouchInProgress(val) {

			//Add or remove event listeners depending on touch status
			if(val===true) {
				$element.bind(MOVE_EV, touchMove);
				$element.bind(END_EV, touchEnd);

				//we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
				if(LEAVE_EV) {
					$element.bind(LEAVE_EV, touchLeave);
				}
			} else {
				$element.unbind(MOVE_EV, touchMove, false);
				$element.unbind(END_EV, touchEnd, false);

				//we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
				if(LEAVE_EV) {
					$element.unbind(LEAVE_EV, touchLeave, false);
				}
			}

			//strict equality to ensure only true and false can update the value
			$element.data(PLUGIN_NS+'_intouch', val === true);
		}

		function createFingerData( index, evt ) {
			var id = evt.identifier!==undefined ? evt.identifier : 0;

			fingerData[index].identifier = id;
			fingerData[index].start.x = fingerData[index].end.x = evt.pageX||evt.clientX;
			fingerData[index].start.y = fingerData[index].end.y = evt.pageY||evt.clientY;

			return fingerData[index];
		}

		function updateFingerData(evt) {

			var id = evt.identifier!==undefined ? evt.identifier : 0;
			var f = getFingerData( id );

			f.end.x = evt.pageX||evt.clientX;
			f.end.y = evt.pageY||evt.clientY;

			return f;
		}

		function getFingerData( id ) {
			for(var i=0; i<fingerData.length; i++) {
				if(fingerData[i].identifier == id) {
					return fingerData[i];
				}
			}
		}

		function createAllFingerData() {
			var fingerData=[];
			for (var i=0; i<=5; i++) {
				fingerData.push({
					start:{ x: 0, y: 0 },
					end:{ x: 0, y: 0 },
					identifier:0
				});
			}

			return fingerData;
		}

		function setMaxDistance(direction, distance) {
    		distance = Math.max(distance, getMaxDistance(direction) );
    		maximumsMap[direction].distance = distance;
		}

		function getMaxDistance(direction) {
			if (maximumsMap[direction]) return maximumsMap[direction].distance;
			return undefined;
		}

		function createMaximumsData() {
			var maxData={};
			maxData[LEFT]=createMaximumVO(LEFT);
			maxData[RIGHT]=createMaximumVO(RIGHT);
			maxData[UP]=createMaximumVO(UP);
			maxData[DOWN]=createMaximumVO(DOWN);

			return maxData;
		}

		function createMaximumVO(dir) {
		    return {
		        direction:dir,
		        distance:0
		    }
		}

		function calculateDuration() {
			return endTime - startTime;
		}

		function calculateTouchesDistance(startPoint, endPoint) {
			var diffX = Math.abs(startPoint.x - endPoint.x);
			var diffY = Math.abs(startPoint.y - endPoint.y);

			return Math.round(Math.sqrt(diffX*diffX+diffY*diffY));
		}

		function calculatePinchZoom(startDistance, endDistance) {
			var percent = (endDistance/startDistance) * 1;
			return percent.toFixed(2);
		}

		function calculatePinchDirection() {
			if(pinchZoom<1) {
				return OUT;
			}
			else {
				return IN;
			}
		}

		function calculateDistance(startPoint, endPoint) {
			return Math.round(Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)));
		}

		function calculateAngle(startPoint, endPoint) {
			var x = startPoint.x - endPoint.x;
			var y = endPoint.y - startPoint.y;
			var r = Math.atan2(y, x); //radians
			var angle = Math.round(r * 180 / Math.PI); //degrees

			//ensure value is positive
			if (angle < 0) {
				angle = 360 - Math.abs(angle);
			}

			return angle;
		}

		function calculateDirection(startPoint, endPoint ) {
			var angle = calculateAngle(startPoint, endPoint);

			if ((angle <= 45) && (angle >= 0)) {
				return LEFT;
			} else if ((angle <= 360) && (angle >= 315)) {
				return LEFT;
			} else if ((angle >= 135) && (angle <= 225)) {
				return RIGHT;
			} else if ((angle > 45) && (angle < 135)) {
				return DOWN;
			} else {
				return UP;
			}
		}

		function getTimeStamp() {
			var now = new Date();
			return now.getTime();
		}

		function getbounds( el ) {
			el = $(el);
			var offset = el.offset();

			var bounds = {
					left:offset.left,
					right:offset.left+el.outerWidth(),
					top:offset.top,
					bottom:offset.top+el.outerHeight()
					}

			return bounds;
		}

		function isInBounds(point, bounds) {
			return (point.x > bounds.left && point.x < bounds.right && point.y > bounds.top && point.y < bounds.bottom);
		};
	}
}));

$(function(){
  //광고 스와이프 UP시 노출
  $("span[role='banner_area']").swipe({
    tap:function(event, target) {
      $("div[role='ad_area']").animate({
        top: "50%"
      }, 500).fadeIn(500);
      $("div[role='banner_wrap']").fadeOut(500);
    },
    swipeUp:function(event, distance, duration, fingerCount, fingerData, currentDirection) {
      $("div[role='ad_area']").animate({
        top: "50%"
      }, 500).fadeIn(500);
      $("div[role='banner_wrap']").fadeOut(500);
    },
    threshold:1,
    allowPageScroll:"vertical"
  });

  //스와이프 Down시 노출된 광고 닫기
  $("span[role='slide_close']").swipe({
    tap:function(event, target) {
      $("div[role='ad_area']").fadeOut(500).animate({
        top: "100%"
      }, 500);
      $("div[role='banner_wrap']").fadeIn(500);
    },
    swipeDown:function(event, distance, duration, figerCount, fingerData, currentDirection) {
      $("div[role='ad_area']").fadeOut(500).animate({
        top: "100%"
      }, 500);
      $("div[role='banner_wrap']").fadeIn(500);
    },
    threshold:1,
    allowPageScroll:"vertical"
  });
});
