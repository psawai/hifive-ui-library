/*
 * Copyright (C) 2012-2014 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function() {

	var sampleController = {
		__name: 'sample.sampleController',

		dividedBoxController: h5.ui.container.DividedBox,
		__meta: {
			dividedBoxController: {
				rootElement: '.dividedBox'
			}
		},

		__init: function() {
			// 最初にボックスを３つ用意
			this.$dividedBox = this.$find('.dividedBox');
			for (var i = 0; i < 3; i++) {
				this.view.append(this.$dividedBox, 'box-template');
			}
		},

		'.insert click': function(context, $el) {
			var $target = $el.parent('.box');
			var index = this.$dividedBox.find('.box').index($target);
			if ($el.hasClass('after')) {
				index++;
			}
			this.dividedBoxController.insert(index, this.view.get('box-template'));
		},

		'.remove click': function(context, $el) {
			var $target = $el.parent('.box');
			var index = this.$dividedBox.find('.box').index($target);
			this.dividedBoxController.remove(index);
		},

		'{.executeRefresh} click': function() {
			this.dividedBoxController.refresh();
		}
	};
	h5.core.expose(sampleController);
})();
$(function() {
	h5.core.controller('.sample', sample.sampleController);
});