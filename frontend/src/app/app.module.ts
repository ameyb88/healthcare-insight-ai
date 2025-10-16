import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent], // <-- add here
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule, // should export RouterModule
    ReactiveFormsModule,
    FormsModule,
  ],
  bootstrap: [AppComponent], // <-- OK now
})
export class AppModule {}
