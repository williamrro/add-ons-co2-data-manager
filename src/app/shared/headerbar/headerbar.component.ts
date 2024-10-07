import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ISubscription } from "rxjs/Subscription";
import { AuthGuard } from "../../guards/auth.guard";

@Component({
  selector: "app-headerbar",
  templateUrl: "./headerbar.component.html",
  styleUrls: ["./headerbar.component.scss"],
})
export class HeaderbarComponent implements OnInit {
  @Input() isT4User: boolean = false;
  hasFpsAccess: boolean = false;
  accessInfoSub$: ISubscription;
  constructor(private router: Router,private authGuard: AuthGuard,) {}

  ngOnInit() {
    this.accessInfoSub$ = this.authGuard.getAccessInfo.subscribe(
      (info: any) => {
        this.hasFpsAccess = info && info.fpsAccess === true;
      }
    );
  }

  onNavigate() {
    this.router.navigateByUrl("/fps");
  }
}
