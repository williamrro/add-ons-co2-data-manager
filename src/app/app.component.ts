import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Broadcaster } from './shared/broadcaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  public rlink:any;
  public ractlink:any;
  public svgLoader: boolean = false;
  public mask: boolean = false;
  private svgloaderB:any;
  private maskloaderB:any;

  constructor(private appService: AppService,
              private broadcaster: Broadcaster) {

  }

  ngOnInit() {
    this.svgloaderB = this.broadcaster.on<string>('svgLoader')
      .subscribe((isVisible: any) => {
        this.svgLoader = isVisible;
      });
    this.maskloaderB = this.broadcaster.on<boolean>('mask')
      .subscribe((isMask: boolean) => {
        this.mask = isMask;
      });
  }

  ngOnDestroy() {
    if(this.svgloaderB) {
      this.svgloaderB.unsubscribe();
    }
    if(this.maskloaderB) {
      this.maskloaderB.unsubscribe();
    }
  }
}
