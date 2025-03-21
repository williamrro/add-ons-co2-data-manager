import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { ISubscription } from "rxjs/Subscription";
import { Broadcaster } from "./shared/broadcaster";
import { SearchService } from "./services/search.service";
import { AuthGuard } from "./guards/auth.guard";
import { AppService } from "./app.service";
declare var window;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "app";
  public rlink: any;
  public ractlink: any;
  public svgLoader: boolean = false;
  public mask: boolean = false;
  private svgloaderB: any;
  private maskloaderB: any;
  isT4User: boolean = false;
  routerSub$: ISubscription;
  accessList: any = [];
  constructor(
    private router: Router,
    private searchService: SearchService,
    private authGuard: AuthGuard,
    private broadcaster: Broadcaster,
    private appService: AppService
  ) {
  }

  ngOnInit() {
    this.appService.getT4Auth().subscribe((resp: any) => {
      console.log(resp);
      window.userpilot.identify(resp["userId"], {
        created_at: new Date().toISOString(),
        role: resp["roles"],
        user_type: resp["userType"],
        email: resp['email'],
        app_name: "co2 Data Manager",
      });
    });
    this.svgloaderB = this.broadcaster
      .on<string>("svgLoader")
      .subscribe((isVisible: any) => {
        this.svgLoader = isVisible;
      });
    this.maskloaderB = this.broadcaster
      .on<boolean>("mask")
      .subscribe((isMask: boolean) => {
        this.mask = isMask;
      });
    this.routerSub$ = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((route: any) => {
        const { url = "" } = route || {};
        const isT4Route = url.includes("/t4");
        this.isT4User = isT4Route;
        if (isT4Route)
          this.searchService.setCurrentT4Tab(/[^/]*$/.exec(url)[0]);
      });

    // In case of authentication for FPS and T4 applications, use below code to set access (first param for FPS and second for T4)
    this.appService.redirectCo2App().subscribe((res) => {
      if (res) {
        this.accessList = res;
        this.authGuard.setAccessInfo(
          this.accessList.includes("FPS"),
          this.accessList.includes("TTSM")
        );
      }
    });
  }

  ngOnDestroy() {
    if (this.svgloaderB) {
      this.svgloaderB.unsubscribe();
    }
    if (this.maskloaderB) {
      this.maskloaderB.unsubscribe();
    }
    if (this.routerSub$) {
      this.routerSub$.unsubscribe();
    }
  }
}
