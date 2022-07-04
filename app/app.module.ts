import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { EditService } from "./edit.service";
import { AppComponent } from './app.component';
import { HttpClient, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [ HttpClientModule,  HttpClientJsonpModule,BrowserModule, BrowserAnimationsModule, ReactiveFormsModule,FormsModule, GridModule ],
  declarations: [ AppComponent ],
  providers: [
    {
      deps: [HttpClient],
      provide: EditService,
      useFactory: (jsonp: HttpClient) => () => new EditService(jsonp),
    },
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
