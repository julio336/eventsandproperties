define(["Ti/_/declare", "Ti/_/UI/KineticScrollView", "Ti/_/style", "Ti/_/lang", "Ti/UI/MobileWeb/TableViewSeparatorStyle", "Ti/UI"], 
	function(declare, KineticScrollView, style, lang, TableViewSeparatorStyle, UI) {

	var setStyle = style.set,
		is = require.is,
		isDef = lang.isDef,
		regexpClickTap = /^(click|singletap)$/,

		// The amount of deceleration (in pixels/ms^2)
		deceleration = 0.001;

	return declare("Ti.UI.TableView", KineticScrollView, {

		constructor: function(args) {

			var self = this,
				scrollbarTimeout,
				contentContainer;
			self._initKineticScrollView(contentContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.SIZE,
				left: 0,
				top: 0,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}), "vertical", "vertical", 1);

			contentContainer._add(self._header = UI.createView({
				height: UI.SIZE, 
				width: UI.INHERIT, 
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));
			contentContainer._add(self._sections = UI.createView({
				height: UI.SIZE, 
				width: UI.INHERIT, 
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));
			contentContainer._add(self._footer = UI.createView({
				height: UI.SIZE, 
				width: UI.INHERIT, 
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));

			self.data = [];
		},

		_handleMouseWheel: function() {
			this._fireScrollEvent("scroll");
		},

		_handleDragStart: function(e) {
			this.fireEvent("dragStart");
		},

		_handleDrag: function(e) {
			this._fireScrollEvent("scroll", e);
		},

		_handleDragEnd: function(e, velocityX, velocityY) {
			var self = this,
				y = -self._currentTranslationY;
			if (isDef(velocityY)) {
				var distance = velocityY * velocityY / (1.724 * deceleration) * (velocityY < 0 ? -1 : 1),
					duration = Math.abs(velocityY) / deceleration,
					translation = Math.min(0, Math.max(self._minTranslationY, self._currentTranslationY + distance));
				self.fireEvent("dragEnd",{
					decelerate: true
				});
				self._animateToPosition(self._currentTranslationX, translation, duration, "ease-out", function() {
					self._setTranslation(self._currentTranslationX, translation);
					self._endScrollBars();
					self._fireScrollEvent("scrollEnd", e);
				});
			}
			
		},

		_fireScrollEvent: function(type, e) {
			// Calculate the visible items
			var firstVisibleItem,
				visibleItemCount = 0,
				contentContainer = this._contentContainer,
				y = -this._currentTranslationY,
				sections = this._sections,
				sectionsList = sections._children,
				len = sectionsList.length;
			for(var i = 0; i < len; i+= 2) {

				// Check if the section is visible
				var section = sectionsList[i],
					sectionOffsetTop = y - section._measuredTop,
					sectionOffsetBottom = section._measuredHeight - sectionOffsetTop;
				if (sectionOffsetTop > 0 && sectionOffsetBottom > 0) {
					var rows = section._rows._children
					for (var j = 1; j < rows.length; j += 2) {
						var row = rows[j],
							rowOffsetTop = sectionOffsetTop - row._measuredTop,
							rowOffsetBottom = row._measuredHeight - rowOffsetTop;
						if (rowOffsetTop > 0 && rowOffsetBottom > 0) {
							visibleItemCount++;
							!firstVisibleItem && (firstVisibleItem = row);
						}
					}
				}
			}

			// Create the scroll event
			this.fireEvent(type, {
				contentOffset: {
					x: 0,
					y: y
				},
				contentSize: {
					width: sections._measuredWidth,
					height: sections._measuredHeight
				},
				firstVisibleItem: firstVisibleItem,
				size: {
					width: contentContainer._measuredWidth,
					height: contentContainer._measuredHeight
				},
				totalItemCount: this.data.length,
				visibleItemCount: visibleItemCount,
				x: e && e.x,
				y: e && e.y
			});
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,
		
		_getContentOffset: function(){
			return {
				x: -this._currentTranslationX,
				y: -this._currentTranslationY
			};
		},
		
		_handleTouchEvent: function(type, e) {
			var i = 0,
				index = 0,
				localIndex,
				sections = this._sections._children,
				row = this._tableViewRowClicked,
				section = this._tableViewSectionClicked;
			if (type === "click" || type === "singletap") {
				if (row && section) {
					
					for (; i < sections.length; i += 2) {
						localIndex = sections[i]._rows._children.indexOf(row);
						if (localIndex !== -1) {
							index += Math.floor(localIndex / 2);
							break;
						} else {
							index += sections[i].rowCount;
						}
					}
					e.row = e.rowData = row;
					e.index = index;
					e.section = section;
					e.searchMode = false; 
	
					KineticScrollView.prototype._handleTouchEvent.apply(this, arguments);
	
					this._tableViewRowClicked = null;
					this._tableViewSectionClicked = null;
				}
			} else {
				KineticScrollView.prototype._handleTouchEvent.apply(this, arguments);
			}
		},

		_createSeparator: function() {
			var separator = UI.createView({
				height: 1,
				width: UI.INHERIT,
				backgroundColor: "white"
			});
			setStyle(separator.domNode,"minWidth","100%"); // Temporary hack until TIMOB-8124 is completed.
			return separator;
		},
		
		_createDecorationLabel: function(text) {
			return UI.createLabel({
				text: text, 
				backgroundColor: "darkGrey",
				color: "white",
				width: UI.INHERIT,
				height: UI.SIZE,
				left: 0,
				font: {fontSize: 22}
			});
		},
		
		_refreshSections: function() {
			for (var i = 0; i < this._sections._children.length; i += 2) {
				this._sections._children[i]._refreshRows();
			}
			this._triggerLayout();
		},
		
		_calculateLocation: function(index) {
			var currentOffset = 0,
				section;
			for(var i = 0; i < this._sections._children.length; i += 2) {
				section = this._sections._children[i];
				currentOffset += section.rowCount;
				if (index < currentOffset) {
					return {
						section: section,
						localIndex: section.rowCount - (currentOffset - index)
					};
				}
			}
			
			// Handle the special case of inserting after the last element in the last section
			if (index == currentOffset) {
				return {
					section: section,
					localIndex: section.rowCount
				};
			}
		},
		
		_insertRow: function(value, index) {
			var location = this._calculateLocation(index);
			if (location) {
				location.section.add(value,location.localIndex); // We call the normal .add() method to hook into the sections proper add mechanism
			}
			this._publish(value);
			this._refreshSections();
		},
		
		_removeRow: function(index) {
			var location = this._calculateLocation(index);
			this._unpublish(location.section._rows._children[2 * location.localIndex + 1]);
			if (location) {
				location.section._removeAt(location.localIndex);
			}
		},

		appendRow: function(value) {
			if (!this._currentSection) {
				this._sections._add(this._currentSection = UI.createTableViewSection({_tableView: this}));
				this._sections._add(this._createSeparator());
				this.data.push(this._currentSection);
			}
			this._currentSection.add(value); // We call the normal .add() method to hook into the sections proper add mechanism
			this._publish(value);
			this._refreshSections();
		},

		deleteRow: function(index) {
			this._removeRow(index);
		},

		insertRowAfter: function(index, value) {
			this._insertRow(value, index + 1);
		},

		insertRowBefore: function(index, value) {
			this._insertRow(value, index);
		},

		updateRow: function(index, row) {
			this._removeRow(index);
			this._insertRow(row, index);
		},

		scrollToIndex: function(index) {
			var location = this._calculateLocation(index);
			location && this._setTranslation(0,-location.section._measuredTop -
				location.section._rows._children[2 * location.localIndex + 1]._measuredTop);
		},
		
		scrollToTop: function(top) {
			this._setTranslation(0,-top);
		},
		
		properties: {
			data: {
				set: function(value) {
					if (is(value,'Array')) {
						
						var retval = [];
						
						// Remove all of the previous sections
						this._sections._removeAllChildren();
						this._currentSection = void 0;
						
						// Convert any object literals to TableViewRow instances
						for (var i in value) {
							if (!isDef(value[i].declaredClass) || (value[i].declaredClass != "Ti.UI.TableViewRow" && value[i].declaredClass != "Ti.UI.TableViewSection")) {
								value[i] = UI.createTableViewRow(value[i]);
							}
						}
			
						// Add each element
						for (var i = 0; i < value.length; i++) {
							if (value[i].declaredClass === "Ti.UI.TableViewRow") {
								// Check if we need a default section
								if (!this._currentSection) {
									this._sections._add(this._currentSection = UI.createTableViewSection({_tableView: this}));
									this._sections._add(this._createSeparator());
									retval.push(this._currentSection);
								}
								this._currentSection.add(value[i]); // We call the normal .add() method to hook into the sections proper add mechanism
							} else if (value[i].declaredClass === "Ti.UI.TableViewSection") {
								value[i]._tableView = this;
								this._sections._add(this._currentSection = value[i]);
								this._sections._add(this._createSeparator());
								retval.push(this._currentSection);
							}
							this._publish(value[i]);
						}
						this._refreshSections();
						
						return retval;
					} else {
						// Data must be an array
						return;
					}
				}
			},
			footerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(this._createDecorationLabel(value));
					}
					return value;
				}
			},
			footerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(value);
					}
					return value;
				}
			},
			headerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(this._createDecorationLabel(value));
						this._header._add(this._createSeparator());
					}
					return value;
				}
			},
			headerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(value);
					}
					return value;
				}
			},
			maxRowHeight: {
				post: "_refreshSections"
			},
			minRowHeight: {
				post: "_refreshSections"
			},
			rowHeight: {
				post: "_refreshSections",
				value: "50px"
			},
			separatorColor: {
				post: "_refreshSections",
				value: "lightGrey"
			},
			separatorStyle: {
				post: "_refreshSections",
				value: TableViewSeparatorStyle.SINGLE_LINE
			}
		}

	});

});