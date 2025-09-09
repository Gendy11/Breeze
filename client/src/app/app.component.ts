import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected title = 'Breeze';

  products:any[]=[];
  constructor(private http:HttpClient){
  }
  baseUrl = 'https://localhost:44376/api/products'
  ngOnInit(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (response) => {
        this.products=response;
        console.log(this.products);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
