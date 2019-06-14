import {
    Component, ElementRef, OnInit, AfterViewChecked, Input, EventEmitter, Output
} from '@angular/core';


declare var $: any;
import Calendar from './calendar'


@Component({
    selector: 'tubDateRange',
    template: '<span></span>'
})
export class tubDateRangeComponent implements OnInit {
    //, AfterViewChecked {


    //————————————————————————————————————————————————————————————————————————————————————

    TEMPLATE = `
    <div class=\"drp-popup\" style=\"display:none;\">\n 
      <div class=\"drp-timeline\">\n    
          <ul class=\"drp-timeline-presets\">
          
          </ul>\n    
          <div class=\"drp-timeline-bar\"></div>\n  
      </div>\n  
      <div class=\"drp-calendars\">\n   
        <div class=\"drp-calendar drp-calendar-start\">\n     
          <div class=\"drp-month-picker\">\n        
             <div class=\"drp-arrow\"><</div>\n        
             <div class=\"drp-month-title\"></div>\n        
             <div class=\"drp-arrow drp-arrow-right\">></div>\n      
          </div>\n     
          <ul class=\"drp-day-headers\"></ul>\n      
          <ul class=\"drp-days\"></ul>\n      
          <div class=\"drp-calendar-date\"></div>\n    
        </div>\n    
        <div class=\"drp-calendar-separator\">
          <button type=button >确定</button>
        </div>\n   
        <div class=\"drp-calendar drp-calendar-end\">\n     
          <div class=\"drp-month-picker\">\n        
              <div class=\"drp-arrow\"><</div>\n        
              <div class=\"drp-month-title\"></div>\n       
              <div class=\"drp-arrow drp-arrow-right\">></div>\n      
          </div>\n      
          <ul class=\"drp-day-headers\"></ul>\n      
          <ul class=\"drp-days\"></ul>\n      
          <div class=\"drp-calendar-date\"></div>\n    
        </div>\n  
      </div>\n  
      <!--<div class=\"drp-tip\"></div>\n 暂时没整好先去掉箭头-->
    </div>`
    //上面暂时没整好先去掉箭头

    regional = []; // Available regional settings, indexed by language code
    // regional[''] = { // Default regional settings

    // };
    _defaults = { // Global defaults for all the datetime picker instances
        defaultRange: "自定义",
        showPreNexBtn: true,
        language: "zh_cn"
    };
    private $select: any;
    $dateRangePicker;
    isHidden = true;
    rangeStart;  //自定义固定时间节点
    rangeEnd;  //自定义固定时间节点
    defaultRange; //自定义默认时间区间（到今天为止）
    customOptionIndex; //这个变量啥意思暂时还不知道

    startCalendar: Calendar;
    endCalendar: Calendar;

    //这个是否能自定义，待定
    RangeNode = [{
        value: 3,
        text: "最近三天",
        selected: false
    },
    {
        value: 7,
        text: "最近一周",
        selected: false
    }, {
        value: 30,
        text: "最近30天",
        selected: false
    }, {
        value: 90,
        text: "最近90天",
        selected: false
    }, {
        value: 180,
        text: "最近180天",
        selected: false
    },
    {
        value: "custom",
        text: "自定义",
        selected: false
    }
    ]

    @Input() public option: any;

    @Output() onDateChange = new EventEmitter<any>();


    constructor(
        private select: ElementRef,
    ) {
        $.extend(this._defaults, this.regional['']);
        this.$select = $(this.select.nativeElement);
    }


    ngOnInit() {
        this.setDefaults(this.option)
        this.$dateRangePicker = $(this.TEMPLATE);
        if (!($("#main").has("#over-lay").length)) {
            $("#main").append($("<div id='over-lay'></div>"));
        }
        $("#over-lay").append(this.$dateRangePicker);

        // this.$select.attr('tabindex', '-1').before(this.$dateRangePicker);
        this.isHidden = true;
        this.rangeStart = this.option.startDate;  //自定义固定时间节点
        this.rangeEnd = this.option.endDate;  //自定义固定时间节点
        this.defaultRange = this.option.defaultRange; //自定义默认时间区间（到今天为止）
        this.customOptionIndex = this.$select[0].length - 1; //这个变量啥意思暂时还不知道
        this.setRange(1); //调用设置初始值的方法,默认初始化是1，也就是今天
        this.initBindings(); //调用绑定一系列监听事件的方法，并按 option 设置节点
        this.showDate(); //显示上面设置的时间，默认值，今天

    }

    ngOnDestroy(): void {
        if (($("#main").has("#over-lay").length)) {
            $("div").remove("#over-lay");
        }
    }

    extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props) {
            if (props[name] === null || props[name] === undefined) {
                target[name] = props[name];
            }
        }
        return target;
    }


    //扩展类，类的方法
    //修改默认的设置
    setDefaults(settings) {
        this.extendRemove(this._defaults, settings || {});
        return this;
    }

    //绑定一系列监听事件
    initBindings() {
        var self;
        self = this; //保留jquery的操作所以不能用箭头表达式
        this.$select.on('focus mousedown', function (e) {
            var $select;
            $select = this;
            self.toggleDropDown()
            setTimeout(function () {
                return $select.blur();
            }, 0);
        });
        this.$dateRangePicker.click(function (evt) {
            return evt.stopPropagation();
        });
        $('body').click(function (evt) { //点击body其他区域，让弹框消失
            if (evt.target === self.$select[0] && self.isHidden) {
                return self.show();
            } else if (evt.target != self.$select[0] && !self.isHidden) {
                return self.hide();
            }
        });
        //上边三个应该是监听事件发生才会执行的，第一次初始化只是绑定了这些监听方法，不会触发
        // this.$select.children().each(function () {
        //     return self.$dateRangePicker.find('.drp-timeline-presets').append($("<li class='" + ((this.selected && 'drp-selected') || '') + "'>" + ($(this).text()) + "<div class='drp-button'></div></li>"));
        // }); //改变时间轴列表的样式（html中已经定义，查找之后直接加样式）

        this.RangeNode.forEach(function (node) {
            if (node.text == self.defaultRange) {
                node.selected = true;
                self.setRange(node.value);  //选中设置中的时间范围并set
            }
            self.$dateRangePicker.find('.drp-timeline-presets').append($("<li id='" + node.value + "' class='" + ((node.selected && 'drp-selected') || '') + "'>" + node.text + "<div class='drp-button'></div></li>"));
            self.onDateChange.emit({
                startDate: self.startDate(),
                endDate: self.endDate()
            })
        }, this);

        this.$dateRangePicker.find('.drp-timeline-presets li').click(function (evt) {
            $(this).addClass('drp-selected').siblings().removeClass('drp-selected');
            var value = parseInt(this.id)
            self.setRange(value);
            //return self.showDate();
        }); //改变时间轴列表选择的时候，会触发，改变了时间Range


        //var a = this.$dateRangePicker.find(".drp-calendar-separator button")
        //点击确定按钮之后的动作
        this.$dateRangePicker.find(".drp-calendar-separator button").click(function () {
            self.showDate();
            self.hide();
            self.onDateChange.emit({
                startDate: self.startDate(),
                endDate: self.endDate()
            })
        })
    }
    toggleDropDown() {
        if (this.isHidden == true) {
            this.show()
        } else {
            this.hide()
        }
    }
    hide() {
        this.$dateRangePicker[0].style.display = "none";
        this.isHidden = true;
    }
    show() {
        //对弹框出现的位置做一个计算

        var top = this.$select[0].offsetTop;
        var left = this.$select[0].offsetLeft;
        var height = this.$select[0].offsetHeight;   //点击处的top、left、height

        //初步计算
        var base_top = top + height + 3;
        var base_left = left;

        //超出计算
        let maxHeight = $(window).height();
        let maxWidth = $(window).width();

        if (base_top + 350 > maxHeight) {
            let final_top = top - 350 - 5;
            this.$dateRangePicker[0].style.top = final_top + "px";
        } else {
            this.$dateRangePicker[0].style.top = base_top + "px";
        }

        if (base_left + 530 < maxWidth) {
            this.$dateRangePicker[0].style.left = base_left + "px";
        }
        else {
            this.$dateRangePicker[0].style.right = 15 + "px";
        }

        // this.$dateRangePicker[0].style.top = top + height + 3 + "px";
        //  this.$dateRangePicker[0].style.left = left + "px";

        this.$dateRangePicker[0].style.display = "block";
        this.isHidden = false;
    }
    showDate() {
        var text;
        text = this.formatDate(this.startDate()) + ' ~ ' + this.formatDate(this.endDate());
        this.$select[0].innerText = text;
    }
    //如果是自定义的时间，则在时间线上选中自定义这个节点
    showCustomDate() {
        this.$dateRangePicker.find('.drp-timeline-presets li:last-child').addClass('drp-selected').siblings().removeClass('drp-selected');
        //this.showDate()
    }
    //对选中的时间做格式化
    formatDate(d) {
        return "" + (d.getFullYear().toString()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
    }
    setRange(daysAgo) {
        //设置初始的两个时间，并把这两个时间显示到两个新创建的日历上
        var endDate, startDate;
        if (daysAgo == "custom") { //如果自定义就把自定义时间传进来
            endDate = new Date(this.rangeEnd);
            startDate = new Date(this.rangeStart);
            this.startCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:first-child'), startDate, true);
            this.endCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:last-child'), endDate, false);
            //在DateRangePicker上加两个日历的实例
            return this.draw();
        } else {//固定时间范围
            if (isNaN(daysAgo)) { //如果daysAgo的格式不对就不做设置，避免后续出错
                return false;
            }
            daysAgo -= 1;
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - daysAgo); //通过时间间距拉开两个时间的距离，以今天时间为基准
            this.startCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:first-child'), startDate, true);
            this.endCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:last-child'), endDate, false);
            //在DateRangePicker上加两个日历的实例
            return this.draw();
        }
    }
    endDate() {
        return this.endCalendar.date;
    }
    startDate() {
        return this.startCalendar.date;
    }
    draw() {
        this.startCalendar.draw();
        return this.endCalendar.draw();
    }

}
