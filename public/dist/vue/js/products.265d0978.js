(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["products"],{"121f":function(t,e,n){},b3a9:function(t,e,n){"use strict";n.r(e);var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"dm_products"},[n("div",{staticStyle:{display:"none"}},[t._v(t._s(t.token))]),n("div",{staticClass:"common_width"},[n("div",{staticClass:"filter_title"},[n("h1",[t._v("商品筛选")]),n("span",[t._v("共 "+t._s(t.total||0)+" 件商品")])]),n("div",{staticClass:"filter_current"},[Object.keys(t.filterObj).length?n("div",[t._l(t.filterObj,(function(e,r,i){return n("el-tag",{key:i,attrs:{size:"small",closable:""},on:{close:function(e){return t.deleteTag(r)}}},[t._v(t._s("brandId"==r?t.BRAND_LIST[e]:e))])})),n("p",{on:{click:t.clearFilter}},[t._v("清空筛选")])],2):n("div",[n("el-tag",{attrs:{size:"small"}},[t._v("暂无筛选条件")])],1)]),n("div",{staticClass:"filter_condition"},t._l(t.filterList,(function(e,r){return n("div",{key:r},[n("el-row",[n("el-col",{attrs:{span:2}},[t._v("品牌：")]),n("el-col",{attrs:{span:22}},t._l(e.brandId,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("brandId",e)}}},[t._v(t._s(t.BRAND_LIST?t.BRAND_LIST[e]:e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("价格：")]),n("el-col",{attrs:{span:22}},t._l(["0-3999","4000-4499","4500-4999","5000-5499","5500-5999","6000-6999","7000以上"],(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("price",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("屏幕尺寸：")]),n("el-col",{attrs:{span:22}},t._l(e.screenSize,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("screenSize",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("处理器：")]),n("el-col",{attrs:{span:22}},t._l(e.cpu,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("cpu",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("内存容量：")]),n("el-col",{attrs:{span:22}},t._l(e.memory,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("memory",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("硬盘容量：")]),n("el-col",{attrs:{span:22}},t._l(e.disk,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("disk",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("系统：")]),n("el-col",{attrs:{span:22}},t._l(e.systems,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("systems",e)}}},[t._v(t._s(e))])})),0)],1),n("el-row",[n("el-col",{attrs:{span:2}},[t._v("厚度：")]),n("el-col",{attrs:{span:22}},t._l(e.thickness,(function(e,r){return n("span",{key:r,on:{click:function(n){return t.currentFilter("thickness",e)}}},[t._v(t._s(e))])})),0)],1)],1)})),0),n("div",{staticClass:"all_products"},[n("Card",{attrs:{list:t.productList,num:5,width:"calc(20% - 10px)",len:56},scopedSlots:t._u([{key:"default",fn:function(e){return[n("div",{staticClass:"dm_card__btn"},[n("el-input-number",{attrs:{"controls-position":"right",min:1,max:99,size:"small"},on:{change:function(n){return t.numberChange(n,e)}},model:{value:e.num,callback:function(n){t.$set(e,"num",n)},expression:"slotProps.num"}}),n("el-button",{attrs:{type:"primary",disabled:t.isDisabled,plain:"",size:"small"},on:{click:function(n){return t.addCartClick(e)}}},[t._v("加入购物车")])],1)]}}])})],1),n("el-pagination",{attrs:{background:"",layout:"prev, pager, next",total:t.total,"hide-on-single-page":""},on:{"current-change":t.pageChange}})],1)])},i=[],a=(n("d81d"),n("a9e3"),n("b64b"),n("96cf"),n("1da1")),s=n("5530"),c=n("2f62"),l={data:function(){return{current:1,pageSize:10,productList:[],filterList:[],total:0,filterObj:{},visible:{},isDisabled:!1}},mounted:function(){this.getProductsData(),this.getFilterData()},updated:function(){this.uname&&this.token||(this.isDisabled=!0)},methods:{numberChange:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=e.id;this.productList.map((function(e){e.id==n&&(e.num=t)}))},addCartClick:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.id,n=t.price,r=t.num;this.isDisabled||this.$store.dispatch("handleAddCart",{list:[{pid:e,num:r,totalprice:n?Number(n)*r:n}]})},clearFilter:function(){this.filterObj={},this.getProductsData()},deleteTag:function(t){delete this.filterObj[t],this.visible[t]=!1,this.getProductsData()},pageChange:function(t){this.current=t,this.getProductsData()},currentFilter:function(t,e){var n={},r={};r[t]=e,Object.keys(r).map((function(t,e){n[t]=!0})),this.filterObj=Object(s["a"])(Object(s["a"])({},this.filterObj),r),this.visible=Object(s["a"])(Object(s["a"])({},this.visible),{},{visible:n}),this.current=1,this.getProductsData()},getProductsData:function(){var t=arguments,e=this;return Object(a["a"])(regeneratorRuntime.mark((function n(){var r,i,a,s,c;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return t.length>0&&void 0!==t[0]?t[0]:{},n.next=3,e.$service.getProductsData({current:e.current,pageSize:e.pageSize,onLine:100,filterList:e.filterObj});case 3:r=n.sent;try{200===r.data.code&&(i=r.data.data||{},a=i.products,s=void 0===a?[]:a,c=i.total,s.map((function(t){t["mainPicture"]=t["mainPicture"]?e.$url+t["mainPicture"]:"",t["num"]=1})),e.productList=s,e.total=c)}catch(l){console.log(l)}case 5:case"end":return n.stop()}}),n)})))()},getFilterData:function(){var t=arguments,e=this;return Object(a["a"])(regeneratorRuntime.mark((function n(){var r,i,a,s,c;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return r=t.length>0&&void 0!==t[0]?t[0]:{},n.next=3,e.$service.getFilterData(r);case 3:i=n.sent;try{200===i.data.code&&(a=i.data||{},s=a.data,c=void 0===s?[]:s,e.filterList=c)}catch(l){console.log(l)}case 5:case"end":return n.stop()}}),n)})))()}},computed:Object(s["a"])({BRAND_LIST:function(){return this.$tableDic.BRAND_LIST}},Object(c["b"])({uname:function(t){return t.uname},token:function(t){return t.token}}))},o=l,u=(n("e911"),n("2877")),d=Object(u["a"])(o,r,i,!1,null,null,null);e["default"]=d.exports},d81d:function(t,e,n){"use strict";var r=n("23e7"),i=n("b727").map,a=n("1dde"),s=n("ae40"),c=a("map"),l=s("map");r({target:"Array",proto:!0,forced:!c||!l},{map:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}})},e911:function(t,e,n){"use strict";var r=n("121f"),i=n.n(r);i.a}}]);
//# sourceMappingURL=products.265d0978.js.map