declare var $: any;

export default class Calendar {

    DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];


    dateRangePicker;
    $calendar;
    date;
    isStartCalendar;
    _visibleMonth;
    _visibleYear;
    $title;
    $dayHeaders;
    $days;
    $dateDisplay;

    constructor(dateRangePicker, $calendar, date, isStartCalendar) {
        /*四个参数分别是:
        产生calendar的daterangepicker，
        将要填充calendar的html元素，
        要设置的初始日期，
        是否是选择开始时间的calendar*/
        this.dateRangePicker = dateRangePicker;
        this.$calendar = $calendar;
        this.date = date;
        this.isStartCalendar = isStartCalendar;
        this.date.setHours(0, 0, 0, 0);
        this._visibleMonth = this.month();
        this._visibleYear = this.year();
        this.$title = this.$calendar.find('.drp-month-title');
        this.$dayHeaders = this.$calendar.find('.drp-day-headers');
        this.$days = this.$calendar.find('.drp-days');
        this.$dateDisplay = this.$calendar.find('.drp-calendar-date');

        let self = this; //同样为了保留大量jQuery操作，暂时不能用箭头表达式

        $calendar.find('.drp-arrow').click(function (evt) {
            if ($(this).hasClass('drp-arrow-right')) {
                self.showNextMonth();
            } else {
                self.showPreviousMonth();
            }
            return false;
        }); //监听选择上月下月的按钮

        // return Calendar;
    }

    showPreviousMonth() {
        if (this._visibleMonth === 1) {
            this._visibleMonth = 12;
            this._visibleYear -= 1;
        } else {
            this._visibleMonth -= 1;
        }
        return this.draw();
    };
    
    //控制显示上月下月的函数，唯一需要注意的是1月和12月会循环出现而且年分也会随之变化
    showNextMonth() {
        if (this._visibleMonth === 12) {
            this._visibleMonth = 1;
            this._visibleYear += 1;
        } else {
            this._visibleMonth += 1;
        }
        return this.draw();
    };

    setDay(day) {
        this.setDate(this.visibleYear(), this.visibleMonth(), day);
        return this.dateRangePicker.showCustomDate();
    };

    setDate(year, month, day) {
        this.date = new Date(year, month - 1, day);
        return this.dateRangePicker.draw();
    };

    draw() {
        var day, _i, _len;
        this.$dayHeaders.empty();
        this.$title.text("" + (this.nameOfMonth(this.visibleMonth())) + " " + (this.visibleYear()));
        for (_i = 0, _len = this.DAYS.length; _i < _len; _i++) {
            day = this.DAYS[_i];
            this.$dayHeaders.append($("<li>" + (day.substr(0, 2)) + "</li>"));
        }
        this.drawDateDisplay();
        return this.drawDays();
    };

    dateIsSelected(date) {
        return date.getTime() === this.date.getTime();
    };

    dateIsInRange(date) {
        return date >= this.dateRangePicker.startDate() && date <= this.dateRangePicker.endDate();
    };

    dayClass(day, firstDayOfMonth, lastDayOfMonth) {
        var classes, date;
        date = new Date(this.visibleYear(), this.visibleMonth() - 1, day);
        classes = '';
        if (this.dateIsSelected(date)) {
            classes = 'drp-day-selected';
        } else if (this.dateIsInRange(date)) {
            classes = 'drp-day-in-range';
            if (date.getTime() === this.dateRangePicker.endDate().getTime()) {
                classes += ' drp-day-last-in-range';
            }
        } else if (this.isStartCalendar) {
            if (date > this.dateRangePicker.endDate()) {
                classes += ' drp-day-disabled';
            }
        } else if (date < this.dateRangePicker.startDate()) {
            classes += ' drp-day-disabled';
        }
        if ((day + firstDayOfMonth - 1) % 7 === 0 || day === lastDayOfMonth) {
            classes += ' drp-day-last-in-row';
        }
        return classes;
    };

    drawDays() {
        var firstDayOfMonth, i, lastDayOfMonth, _i, _j, _ref;
        var self = this;
        this.$days.empty();
        firstDayOfMonth = this.firstDayOfMonth(this.visibleMonth(), this.visibleYear());
        lastDayOfMonth = this.daysInMonth(this.visibleMonth(), this.visibleYear());
        for (i = _i = 1, _ref = firstDayOfMonth - 1; _i <= _ref; i = _i += 1) {
            this.$days.append($("<li class='drp-day drp-day-empty'></li>"));
        }
        for (i = _j = 1; _j <= lastDayOfMonth; i = _j += 1) {
            this.$days.append($("<li class='drp-day " + (this.dayClass(i, firstDayOfMonth, lastDayOfMonth)) + "'>" + i + "</li>"));
        }
        return this.$calendar.find('.drp-day').click(function (evt) {
            var day;
            if ($(this).hasClass('drp-day-disabled')) {
                return false;
            }
            day = parseInt($(this).text(), 10);
            if (isNaN(day)) {
                return false;
            }
            return self.setDay(day);
        });
    };

    drawDateDisplay() {
        return this.$dateDisplay.text([this.year(), this.month(), this.day()].join('-'));
    };

    //月
    month() {
        return this.date.getMonth() + 1;
    };

    //日
    day() {
        return this.date.getDate();
    };

    //星期
    dayOfWeek() {
        return this.date.getDay() + 1;
    };

    //年
    year() {
        return this.date.getFullYear();
    };

    //日历上显示的月
    visibleMonth() {
        return this._visibleMonth;
    };

    //日历上显示的年
    visibleYear() {
        return this._visibleYear;
    };

    //月的名字
    nameOfMonth(month) {
        return this.MONTHS[month - 1];
    };

    //月的第一天是周几？
    firstDayOfMonth(month, year) {
        return new Date(year, month - 1, 1).getDay() + 1;
    }

    //这个月有哪些天
    daysInMonth(month, year) {
        month || (month = this.visibleMonth());
        year || (year = this.visibleYear());
        return new Date(year, month, 0).getDate();
    }
}