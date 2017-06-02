//函数自执行方式消除和用户的变量冲突
(function(root,factory){
	root.lazy=factory(window.zepto || window.jQuery || $)
})(window,function($){
	//使用$.fn.xxx挂载在$上
	$.fn.lazy=function(setting){
		//初始化构造函数
		var ll=new LazyFn();
		//使用$自带的方法增加opt的选项
		var opt=$.extend({},setting)
		ll.init(opt);
		//返回构造函数方便链式调用
		return this;
	}
	
	//构造函数
	function LazyFn(){
		//加载动画图
		this.loadImg="img/loading.gif";
		//this.setting默认选项
		this.setting={
			elements:"",
			container:window,
			event:'scroll',
			effect:'show',
			effectArgs:null,
			loadDom:"",
			offset:"",
			load:null
		}
	}
	//原型链
	LazyFn.prototype={
		//初始化
		init:function(setting){
			//首先把传来的参数替换默认的参数
			this.setting = $.extend(this.setting,setting);
			this.elements = $(this.setting.elements);
			this.loadImg = this.setting.loadImg || this.loadImg;
			this.loadDom = this.setting.loadDom;
			//绑定事件
			this.bindEvent();
			if(this.setting.event == "scroll"){
				this.load();
			}
			this.initImg();
		},
		initImg: function(){
			//保存一下this
			var _this = this;
			//遍历所有需要懒加载的ele元素
			this.elements.each(function(){
				var $this=$(this);
				if(($this.attr("src") == undefined || $this.attr("src") == "" || $this.attr("src") == false)&&$this.is("img")){
					$this.attr("src") == $this.loadImg;
					if (_this.setting.loadDom){
						var loadDom = $(_this.setting.loadDom).clone();
						$this.parent().append(loadDom);
						$this.parent().css({
							"position":"relative"
						});
						loadDom.css({
							"position":"absolute",
							"top":$this.position().top,
							"left":$this.position().left,
							"width":"100%",
							"height":"100%",
							"text-aligin":"center"
						}).prop("class","load-dom");
						
					}
					
				}
			})
		},
		//绑定事件
		bindEvent: function(){
			var _this = this;
			var container = $(_this.setting.container);
			container.on(this.setting.event,function(){
				_this.load();

			});
			container.on("resize",function(){
				_this.load();
			});
		},
		load: function(){
			var _this = this;
			this.elements.each(function(){
				var $this = $(this);
				if(this.loaded){
					return
				}
				if(_this.checkPosition(this)){
					_this.show(this)
				}
				_this.setting.load && _this.setting.load.call(_this,this);
			})
		},
		checkPosition: function(img){
			var offsetTop = $(img).offset().top;
			var clientHeight = window.clientHeight || document.documentElement.clientHeight || document.doby.clientHeight;
			var clientWidth = window.clientWidth || document.documentElement.clientWidth || document.doby.clientWidth;
			var scrollTop = $(window).scrollTop();
			
			if(offsetTop+this.setting.offset<=clientHeight+scrollTop){
				return true;
			}
			return false;
		},
		show:function(img){
			var _this=this;
			var $this=$(img);
			var self=img;
			self.loaded = false;
			var original = $this.attr("data-src");
			$('<img/>').attr('src',original).on('load',function(){
				self.loaded = true;
				$this.hide();
				if($this.is('img')){
					$this.attr('src',original)
				}else{
					$this.attr('background','url('+original+')');
				}
				$this.siblings('.load-dom').remove();
				$this[_this.setting.effect](_this.setting.effectArgs)
			})
		}
	}
		return LazyFn;
})
