/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
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
 * hifive
 */

/*global h5 */

// ---- Controller ---- //
(function($) {
	'use strict';

	var datagrid = h5.ui.components.datagrid;

	var log = h5.log.createLogger('sample');

	var initParam = {
		searcher: {
			type: 'all'
		},

		mapper: {
			type: 'property',
			param: {
				direction: 'horizontal',
				visibleProperties: {
					header: ['date'],
					main: ['name', 'id', 'position', 'place', 'tel', 'note']
				},
				dataDirectionSize: {
					size: 170
				}
			}
		},

		view: {
			type: 'table',
			param: {
				cellClassDefinition: {},
				disableInput: function() {
					return false;
				}
			}
		},

		properties: {
			date: {
				size: 50,
				headerValue: '日時'
			},

			name: {
				size: 50,
				sortable: true,
				headerValue: '担当者'
			},

			id: {
				size: 50,
				sortable: true,
				headerValue: 'ID'
			},

			place: {
				size: 50,
				headerValue: '勤務地'
			},

			position: {
				size: 50,
				headerValue: '部署'
			},

			tel: {
				size: 50,
				headerValue: 'TLE'
			},

			note: {
				size: 50
			}
		}
	};

	/**
	 * 横スクロールグリッドコントローラ
	 *
	 * @class
	 * @name horiozntalScrollGridController
	 */
	var horizontalScrollGridController = {

		/**
		 * コントローラ名
		 *
		 * @memberOf datagrid.sample.horizontalScrollGridController
		 * @type string
		 */
		__name: 'datagrid.sample.horizontalScrollGridController',

		__meta: {
			_gridController: {
				rootElement: '#grid'
			}
		},

		// --- 子コントローラ --- //
		_gridController: datagrid.GridController,

		// --- ライフサイクル関連メソッド --- //
		__ready: function() {
			this.init(1000);
		},

		// --- イベントハンドラ --- //
		/**
		 * サンプルデータ件数の変更
		 *
		 * @memberOf datagrid.sample.scrollGridController
		 * @param
		 */
		'.create-record-form submit': function(context) {
			context.event.preventDefault();
			var num = parseInt(this.$find('[name="num-of-record"]').val());
			if (num !== num) {
				return;
			}
			this.setData(num);
		},

		// --- Public Method --- //
		init: function(num) {
			// サンプルデータ生成
			var dataSource = datagrid.createDataSource({
				idProperty: 'id',
				type: 'local',
				param: sample.createData(num)
			});

			//データグリッド初期化
			this._gridController.activate(dataSource, initParam);

			datagrid.util.delay(1000, this.own(function() {
				this._gridController.search({});
			}));
		}
	};

	$(function() {
		h5.core.controller('body', horizontalScrollGridController);
	});

})(jQuery);