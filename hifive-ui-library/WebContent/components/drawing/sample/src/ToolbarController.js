(function() {
	//--------------------------------------------
	// ToolbarControllerで使用する内部コントローラ
	//--------------------------------------------
	/**
	 * ツールメニューの開閉を行うコントローラ
	 */
	var toolMenuController = {
		/**
		 * @memberOf sample.ToolMenuController
		 */
		__name: 'sample.toolMenuController',

		//--------------------
		// メニュー操作
		//--------------------
		/**
		 * メニューの開閉
		 *
		 * @param context
		 */
		'.menu-wrapper .menu-button h5trackstart': function(context, $el) {
			var $wrapper = $el.parent('.menu-wrapper');
			var $list = $wrapper.find('.menu-list');
			if ($list.hasClass('display-none')) {
				this._openMenu($wrapper);
			} else {
				this._closeMenu($wrapper);
			}
		},

		/**
		 * メニューリストの何れかが選択されたらメニューを隠す
		 *
		 * @param context
		 * @param $el
		 */
		'.menu-wrapper .menu-list h5trackstart': function(context, $el) {
			if ($(context.event.target).hasClass('disabled')) {
				// disabledだったら何もしない
				return;
			}
			this._closeMenu($el.parent());
		},

		/**
		 * メニューを開く
		 *
		 * @private
		 * @param $wrapper
		 */
		_openMenu: function($wrapper) {
			// 左メニュー、右メニューに対応
			var $list = $wrapper.find('.menu-list');
			var isLeft = $wrapper.data('menu-side') === 'left';
			$list.removeClass('display-none');
			var h = $list.height();
			var w = $list.width();
			$list.css({
				top: -h,
				left: isLeft ? 0 : -w + $el.width()
			});
			$wrapper.addClass('open');
		},

		/**
		 * メニューを閉じる
		 *
		 * @private
		 * @param $wrapper
		 */
		_closeMenu: function($wrapper) {
			var $list = $wrapper.find('.menu-list');
			$list.addClass('display-none');
		}
	};

	//--------------------------------------------
	// ToolbarController
	//--------------------------------------------

	/**
	 * ToolbarController
	 *
	 * @name sample.ToolbarController
	 */
	var controller = {

		/**
		 * コントローラ名
		 *
		 * @memberOf sample.ToolbarController
		 */
		__name: 'sample.ToolbarController',

		/**
		 * メニューコントローラ
		 *
		 * @private
		 * @memberOf sample.ToolbarController
		 */
		_menuController: toolMenuController,

		/**
		 * スタンプリスト要素
		 */
		_$stampList: null,

		/**
		 * ドラッグ中のスタンプ
		 */
		_$draggingStamp: null,

		/**
		 * 設定の一時保存
		 */
		_savedSettings: null,

		__init: function() {
			this._$stampList = this.$find('.stamp-list');

			// スライダーの設定(nouislider使用)
			$('.opacity-slidebar').each(function() {
				var $this = $(this);
				$this.noUiSlider({
					start: 100,
					direction: 'rtl',
					orientation: 'vertical',
					step: 1,
					range: {
						min: 0,
						max: 100
					}
				});
			});
			this.$find('.stroke-width-slidebar').noUiSlider({
				start: 5,
				direction: 'ltr',
				step: 1,
				range: {
					min: 1,
					max: 50
				}
			});
			this.$find('.background-color-slidebar').noUiSlider({
				start: 100,
				direction: 'ltr',
				step: 1,
				range: {
					min: 0,
					max: 100
				}
			});

			// ポップアップの設定
			this._backgroundPopup = h5.ui.popupManager.createPopup('backgroundPopup', null, null,
					null, {
						header: false
					});
			this._backgroundPopup.setContents(this.$find('.popup-contents-wrapper').find(
					'.background-popup'));

			this._loadPopup = h5.ui.popupManager.createPopup('loadPopup', null, null, null, {
				header: false
			});
			this._loadPopup.setContents(this.$find('.popup-contents-wrapper').find('.load-popup'));
		},

		/**
		 * ポップアップを表示
		 *
		 * @param
		 */
		'.popup-open h5trackstart': function(context, $el) {
			if ($el.hasClass('disabled')) {
				return;
			}
			var popupCls = $el.data('popup-cls');
			this._showPopup(popupCls);
		},

		/**
		 * undo
		 *
		 * @param context
		 */
		'.undo h5trackstart': function(context) {
			// ダブルタップによるzoomが動かないようにpreventDefault
			context.event.preventDefault();
			this.hideOptionView();
			this.trigger('undo');
		},

		/**
		 * redo
		 *
		 * @param context
		 */
		'.redo h5trackstart': function(context) {
			context.event.preventDefault();
			this.hideOptionView();
			this.trigger('redo');
		},

		/**
		 * 全て選択
		 */
		'.select-all h5trackstart': function(context) {
			this.trigger('select-all');
		},

		/**
		 * 全て削除
		 */
		'.remove-all h5trackstart': function() {
			this.trigger('remove-all');
		},

		/**
		 * モード選択：select
		 *
		 * @param context
		 * @param $el
		 */
		'.mode-select h5trackstart': function(context, $el) {
			context.event.preventDefault();
			this.hideOptionView();
			this.trigger('shape-select');
			this.$find('.toolbar-icon').removeClass('selected');
			$el.addClass('selected');
		},

		/**
		 * 画像にexport
		 *
		 * @param context
		 */
		'.export h5trackstart': function(context) {
			this.trigger('export');
		},

		/**
		 * ツールの選択
		 *
		 * @param context
		 * @param $el
		 */
		'.toolbar-icon h5trackstart': function(context, $el) {
			context.event.preventDefault();
			var toolName = $el.data('tool-name');
			var isSelected = $el.hasClass('selected');
			if (isSelected) {
				return;
			}
			// スタンプならスタンプリストを表示
			if (toolName === 'stamp') {
				var offset = $el.offset();
				this.hideOptionView();
				this._showStampList();
			} else {
				this._hideStampList();
			}
			this.$find('.toolbar-icon').removeClass('selected');
			this.$find('.mode-select').removeClass('selected');
			$el.addClass('selected');

			this.trigger('tool-select', toolName);
		},

		'.stamp-img h5trackstart': function(context, $el) {
			if ($el.hasClass('selected')) {
				return;
			}
			this.$find('.stamp-img').removeClass('selected');
			$el.addClass('selected');
		},

		//--------------------------------------------------------
		// 色の設定
		//--------------------------------------------------------
		'.pallete-color h5trackstart': function(context, $el) {
			var $selectedColor = this.$find('.color-pallete .selected .selected-color');
			if ($selectedColor.length === 0) {
				return;
			}
			var color = $el.css('background-color');
			$selectedColor.css('background-color', color);
			var isFill = $selectedColor.hasClass('fill');

			this.trigger(isFill ? 'fill-change' : 'stroke-change', color);
		},

		'.selected-color h5trackstart': function(context, $el) {
			if ($el.parent().hasClass('disabled')) {
				return;
			}
			var $parent = $el.parents('.selected-color-wrapper');
			var $slidebar = $parent.find('.opacity-slidebar-wrapper');
			$el.parents('.color-pallete').find('.selected').removeClass('selected');
			$el.parent().addClass('selected');
			// 表示/非表示切替
			if ($slidebar.hasClass('display-none')) {
				$slidebar.removeClass('display-none');
				var top = $slidebar.outerHeight();
				var width = $el.innerWidth();
				$slidebar.css({
					top: -top,
					left: $el.offset().left,
					width: width
				});
			} else {
				$slidebar.addClass('display-none');
			}
		},

		'.opacity-slidebar-wrapper slide': function(context, $el) {
			var $target = $(context.event.target);
			var val = parseInt($target.val());
			$el.find('.slider-value').text(val);
			$el.parent().find('.selected-color').css('opacity', val / 100);
			if ($target.hasClass('opacity-fill')) {
				this.trigger('fill-opacity-change', val / 100);
			} else {
				this.trigger('stroke-opacity-change', val / 100);
			}
		},

		//--------------------------------------------------------
		// ストローク幅
		//--------------------------------------------------------
		'.stroke-width-slider-wrapper slide': function(context, $el) {
			var $target = $(context.event.target);
			var val = parseInt($target.val());
			$el.find('.slider-value').text(val);
			this.trigger('stroke-width-change', val);
		},

		//--------------------------------------------------------
		// スタンプ
		//--------------------------------------------------------
		'.stamp-list .stamp-img h5trackstart': function(context, $el) {
			var $stamp = $el.find('img').clone();

			var event = context.event;
			var x = event.pageX;
			var y = event.pageY;
			$stamp.css({
				position: 'absolute',
				display: 'block'
			});
			$(this.rootElement).append($stamp);
			// height/widthはdisplay:blockで配置してから取得
			var height = $stamp.height();
			var width = $stamp.width();
			$stamp.addClass('dragging');
			$stamp.css({
				left: x - width / 2,
				top: y - height / 2
			});
			this._$draggingStamp = $stamp;
		},

		'.stamp-list .stamp-img h5trackmove': function(context) {
			// クローンしたimg要素をポインタに追従
			var $stamp = this._$draggingStamp;
			var event = context.event;
			var x = event.pageX;
			var y = event.pageY;
			var height = $stamp.height();
			var width = $stamp.width();
			var left = x - width / 2;
			var top = y - height / 2;
			$stamp.css({
				display: 'block',
				left: left,
				top: top
			});
		},

		'.stamp-list .stamp-img h5trackend': function(context) {
			var $stamp = this._$draggingStamp;
			var event = context.event;
			var height = $stamp.height();
			var width = $stamp.width();
			this.trigger('dropstamp', {
				img: this._$draggingStamp,
				x: event.pageX - width / 2,
				y: event.pageY - height / 2
			});

			$stamp.removeClass('dragging');
			$stamp.remove();
			this._$draggingStamp = null;
		},

		//--------------------------------------------------------
		// 背景の設定
		//--------------------------------------------------------
		/**
		 * 背景画像の設定
		 *
		 * @memberOf sample.ToolbarController
		 * @param context
		 */
		'{.background-popup .set-background} h5trackstart': function(context, $el) {
			var $parent = $el.parents('.background-popup');
			var element, fillMode;
			var val = $parent.find('.background-image-list').val();
			if (val !== 'none') {
				element = this.$find('.drawing-image.background')[parseInt(val)];
				fillMode = $parent.find('.background-fillmode-list').val();
			}
			var color, opacity;
			if ($parent.find('.background-color-list') !== 'none') {
				color = $parent.find('.background-color-selected').css('background-color');
				opacity = $parent.find('.background-color-selected').css('opacity');
			}

			this.trigger('set-background', {
				element: element,
				fillMode: fillMode,
				color: color,
				opacity: opacity
			});
		},

		/**
		 * 背景画像リストの表示
		 *
		 * @param context
		 * @param $el
		 */
		'{.background-popup .background-image-list} change': function(context, $el) {
			var $fillModeWrapper = $el.parents('.background-popup').find(
					'.background-fillmode-wrapper');
			if ($el.val() === 'none') {
				$fillModeWrapper.addClass('display-none');
			} else {
				$fillModeWrapper.removeClass('display-none');
			}
		},

		/**
		 * 背景色の設定の表示
		 *
		 * @param context
		 * @param $el
		 */
		'{.background-popup .background-color-list} change': function(context, $el) {
			var $parent = $el.parents('.background-popup');
			var $colorList = $parent.find('.background-color-palette');
			var $opacity = $parent.find('.background-color-opacity');
			var $selectedWrapper = $parent.find('.background-color-selected-wrapper');
			if ($el.val() === 'none') {
				$colorList.addClass('display-none');
				$opacity.addClass('display-none');
				$selectedWrapper.addClass('display-none');
				this._backgroundPopup.refresh();
			} else {
				$colorList.removeClass('display-none');
				$opacity.removeClass('display-none');
				$selectedWrapper.removeClass('display-none');
				this._backgroundPopup.refresh();
			}
		},

		/**
		 * 背景色の透明度の設定
		 */
		'{.background-popup .background-color-slidebar} slide': function(context, $el) {
			var $parent = $el.parents('.background-popup');
			var val = parseInt($el.val());
			var opacity = val / 100;
			$parent.find('.background-color-opacity .opacity-value').text(val);
			$parent.find('.background-color-palette .pallete-color').css('opacity', opacity);
			var $selected = $parent.find('.background-color-selected');
			$selected.css({
				opacity: opacity
			});
		},

		/**
		 * 背景色の選択
		 *
		 * @param context
		 * @param $el
		 */
		'{.background-popup .pallete-color} h5trackstart': function(context, $el) {
			var $parent = $el.parents('.background-popup');
			var $selected = $parent.find('.background-color-selected');
			var opacity = $el.css('opacity');
			var color = $el.css('background-color');
			$selected.css({
				backgroundColor: color,
				opacity: opacity
			});
		},


		'.remove-selected-shape h5trackstart': function() {
			this.trigger('remove-selected-shape');
		},

		_showStampList: function(position) {
			this._$stampList.removeClass('display-none');
			var $stampIcon = $('[data-tool-name="stamp"]');
			var offset = $stampIcon.offset();
			this._$stampList.css({
				left: offset.left + $stampIcon.width() - this._$stampList.width(),
				top: offset.top + $stampIcon.height() + 1
			});
		},

		_hideStampList: function() {
			this._$stampList.addClass('display-none');
		},

		_hideOpacitySlideBar: function() {
			this.$find('.opacity-slidebar-wrapper').addClass('display-none');
		},

		hideOptionView: function() {
			this._hideOpacitySlideBar();
			this._hideStampList();
		},

		/**
		 * 現在の色選択状態、線の幅をセーブする
		 */
		saveSettings: function() {
			this._savedSettings = {
				strokeColor: this.$find('.selected-color.stroke').css('background-color'),
				fillColor: this.$find('.selected-color.fill').css('background-color'),
				strokeOpacity: parseInt(this.$find('.opacity-slidebar.opacity-stroke').val()) / 100,
				fillOpacity: parseInt(this.$find('.opacity-slidebar.opacity-fill').val()) / 100,
				strokeWidth: parseInt(this.$find('.stroke-width-slidebar').val())
			};
		},

		/**
		 * 背景画像、背景色設定ポップアップ
		 */
		_backgroundPopup: null,

		/**
		 * 色選択状態、線の幅をsaveSettingsした時の状態に戻す
		 */
		restoreSettings: function() {
			var savedSettings = this._savedSettings;
			if (!savedSettings) {
				return;
			}

			this.setStrokeColor(savedSettings.strokeColor, savedSettings.strokeOpacity);
			this.setFillColor(savedSettings.fillColor, savedSettings.fillOpacity);
			this.setStrokeWidth(savedSettings.strokeWidth);
		},

		setStrokeColor: function(color, opacity) {
			var $strokeColor = this.$find('.selected-color.stroke');
			var $strokeOpacity = this.$find('.opacity-slidebar.opacity-stroke');
			var $strokeLabel = $strokeOpacity.parent().find('.slider-value');
			$strokeColor.css('background-color', color);
			$strokeColor.css('opacity', opacity);
			$strokeOpacity.val(parseInt(100 * opacity));
			$strokeLabel.text(parseInt(100 * opacity));
		},

		setFillColor: function(color, opacity) {
			var $fillColor = this.$find('.selected-color.fill');
			var $fillOpacity = this.$find('.opacity-slidebar.opacity-fill');
			var $fillLabel = $fillOpacity.parent().find('.slider-value');
			$fillColor.css('background-color', color);
			$fillColor.css('opacity', opacity);
			$fillOpacity.val(parseInt(100 * opacity));
			$fillLabel.text(parseInt(100 * opacity));
		},

		setStrokeWidth: function(width) {
			var $strokeWidth = this.$find('.stroke-width-slidebar');
			var $strokeWidthLabel = $strokeWidth.parent().find('.slider-value');
			$strokeWidth.val(width);
			$strokeWidthLabel.text(width);
		},

		disableStrokeColor: function() {
			this.$find('.selected-color-wrapper.stroke').addClass('disabled').removeClass(
					'selected');
			this.$find('.opacity-slidebar-wrapper.opacity-stroke').addClass('display-none');
		},

		disableFillColor: function() {
			this.$find('.selected-color-wrapper.fill').addClass('disabled').removeClass('selected');
			this.$find('.opacity-slidebar-wrapper.opacity-fill').addClass('display-none');
		},

		disableStrokeWidth: function() {
			this.$find('.stroke-width-slider-wrapper').addClass('disabled');
			this.$find('.stroke-width-slidebar').attr('disabled', 'disabled');
		},

		disableRemove: function() {
			this.$find('.remove-selected-shape').addClass('disabled');
		},

		enableStrokeColor: function() {
			this.$find('.selected-color-wrapper.stroke').removeClass('disabled').addClass(
					'selected');
			this.$find('.selected-color-wrapper.fill').removeClass('selected');
		},

		enableFillColor: function() {
			this.$find('.selected-color-wrapper.fill').removeClass('disabled').addClass('selected');
			this.$find('.selected-color-wrapper.stroke').removeClass('selected');
		},
		enableStrokeWidth: function() {
			this.$find('.stroke-width-slider-wrapper').removeClass('disabled');
			this.$find('.stroke-width-slidebar').removeAttr('disabled');
		},

		enableRemove: function() {
			this.$find('.remove-selected-shape').removeClass('disabled');
		},

		//---------------------------
		// セーブ/ロード
		//---------------------------
		/**
		 * セーブ
		 */
		'.save h5trackstart': function() {
			this.trigger('save');
			this.$find('.popup-open[data-popup-cls="load-popup"]').removeClass('disabled');
		},

		/**
		 * ロード
		 *
		 * @param context
		 */
		'{.load-popup .load} h5trackstart': function(context, $el) {
			var $select = $el.parents('.load-popup').find('.load-data-list');
			var saveNo = $select.val();
			var label = $select.find(':selected').text();
			if (!confirm(h5.u.str.format('{0}\nをロードします。よろしいですか？', label))) {
				return;
			}
			this.trigger('load', saveNo);
			this._loadPopup.hide();
		},

		/**
		 * セーブデータを追加
		 *
		 * @param saveNo
		 */
		appendSaveDataList: function(saveNo) {
			var label = h5.u.str.format('[{0}] {1}', saveNo, sample.util.dateFormat(new Date()));
			var $option = $(h5.u.str.format('<option value="{0}">{1}</option>', saveNo, label));
			$('.load-data-list').prepend($option);
			$option.prop('selected', true);
			alert('セーブしました\n' + label);
		},

		//-----------------------------------
		// ポップアップ
		//-----------------------------------
		/**
		 * ポップアップ
		 */
		'{.popupCloseBtn} h5trackstart': function() {
			this._hidePopup();
		},
		/**
		 * ポップアップの表示
		 *
		 * @param cls
		 */
		_showPopup: function(cls) {
			switch (cls) {
			case 'background-popup':
				this._backgroundPopup.show();
				break;
			case 'load-popup':
				this._loadPopup.show();
			}
		},
		/**
		 * ポップアップを隠す
		 *
		 * @param cls
		 */
		_hidePopup: function() {
			this._backgroundPopup.hide();
			this._loadPopup.hide();
		}
	};
	h5.core.expose(controller);
})();