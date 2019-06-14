import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  startDateNew;
  endDateNew;

  dateOpt = {
    defaultRange: "自定义",
    startDate: "2018-06-01",
    endDate: "2018-12-31",
    language: "ch"
}

dateRangeChange(date) {
  this.startDateNew = date.startDate;
  this.endDateNew = date.endDate;
}

}
